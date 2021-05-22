export enum ConfigType {
  Boolean = 'bool',
  Tristate = 'tristate',
  String = 'string',
  Hex = 'hex',
  Integer = 'int'
}

export interface KConfig {
  kconfig: string;
  config: string;
}

export interface IConfig {
  readonly name: string;
  readonly isEnabled: boolean;
  value: string | undefined;
}

export class ConditionNode {
  private _symbol?: string;
  private _relation?: '||' | '&&' | '!' | '!=' | '=' | '<' | '<=' | '>' | '>=';
  private _leftHand?: ConditionNode;
  private _rightHand?: ConditionNode;

  constructor(private parser: KConfigParser, private tokens: string[]) {
    if (tokens.length === 1) {
      this._symbol = tokens[0];
    }
    else {
      const groups: string[][] = [];
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token === '(') {
          let depth = 1;
          const group: string[] = []
          while (++i < tokens.length) {
            token = tokens[i];
            if (token === '(') {
              depth++;
            }
            if (token === ')') {
              depth--;
              if (depth === 0) {
                break;
              }
            }
            group.push(token);
          }
          groups.push(group);
        }
        else {
          groups.push([token]);
        }
      }
      const notEqualIndex = groups.findIndex(group => group[0] === '!=');
      const eqaulIndex = groups.findIndex(group => group[0] === '=');
      const lessIndex = groups.findIndex(group => group[0] === '<');
      const lessOrEqualIndex = groups.findIndex(group => group[0] === '<=');
      const moreIndex = groups.findIndex(group => group[0] === '>');
      const moreOrEqualIndex = groups.findIndex(group => group[0] === '>=');
      const andIndex = groups.findIndex(group => group[0] === '&&');
      const orIndex = groups.findIndex(group => group[0] === '||');
      const negateIndex = groups.findIndex(group => group[0] === '!');
      if (
        andIndex >= 0 ||
        orIndex >= 0 ||
        notEqualIndex >= 0 ||
        eqaulIndex >= 0 ||
        lessIndex >= 0 ||
        lessOrEqualIndex >= 0 ||
        moreIndex >= 0 ||
        moreOrEqualIndex >= 0
      ) {
        let index = -1;
        if (andIndex >= 0) {
          this._relation = '&&';
          index = andIndex;
        }
        else if (orIndex >= 0) {
          this._relation = '||';
          index = orIndex;
        }
        else if (notEqualIndex >= 0) {
          this._relation = '!=';
          index = notEqualIndex;
        }
        else if (eqaulIndex >= 0) {
          this._relation = '=';
          index = eqaulIndex;
        }
        else if (lessIndex >= 0) {
          this._relation = '<';
          index = lessIndex;
        }
        else if (lessOrEqualIndex >= 0) {
          this._relation = '<=';
          index = lessOrEqualIndex;
        }
        else if (moreIndex >= 0) {
          this._relation = '>';
          index = moreIndex;
        }
        else if (moreOrEqualIndex >= 0) {
          this._relation = '>=';
          index = moreOrEqualIndex;
        }
        const beforeGroups: string[][] = [];
        const afterGroups: string[][] = [];
        for (let i = 0; i < index; i++) {
          beforeGroups.push(groups[i]);
        }
        for (let i = index + 1; i < groups.length; i++) {
          afterGroups.push(groups[i]);
        }
        this._leftHand = new ConditionNode(this.parser, this.flattenGroups(beforeGroups));
        this._rightHand = new ConditionNode(this.parser, this.flattenGroups(afterGroups));
      }
      else if (negateIndex === 0) {
        this._relation = '!';
        this._leftHand = new ConditionNode(this.parser, this.flattenGroups(groups.slice(1)));
      }
      else {
        console.log('ERROR parsing condition', groups);
      }
    }
  }

  private flattenGroups(groups: string[][]): string[] {
    const tokens: string[] = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group.length > 1 && groups.length > 1)  {
        tokens.push('(');
        tokens.push(...group);
        tokens.push(')');
      } else {
        tokens.push(...group);
      }
    }
    return tokens;
  }

  get isTrue(): boolean {
    if (this._symbol) {
      return !!this.parser.getConfigEnabled(this._symbol);
    }
    if (this._relation === '&&') {
      return this._leftHand!.isTrue && this._rightHand!.isTrue;
    }
    if (this._relation === '||') {
      return this._leftHand!.isTrue || this._rightHand!.isTrue;
    }
    if (this._relation === '!=') {
      return this._leftHand!.symbolValue !== this._rightHand!.symbolValue;
    }
    if (this._relation === '=') {
      return this._leftHand!.symbolValue === this._rightHand!.symbolValue;
    }
    if (this._relation === '<') {
      return Number(this._leftHand!.symbolValue) < +Number(this._rightHand!.symbolValue);
    }
    if (this._relation === '<=') {
      return Number(this._leftHand!.symbolValue) <= +Number(this._rightHand!.symbolValue);
    }
    if (this._relation === '>') {
      return Number(this._leftHand!.symbolValue) > Number(this._rightHand!.symbolValue);
    }
    if (this._relation === '>=') {
      return Number(this._leftHand!.symbolValue) >= Number(this._rightHand!.symbolValue);
    }
    if (this._relation === '!') {
      return !this._leftHand!.isTrue;
    }
    throw new Error('Invalid condition');
  }

  get symbolValue(): string | undefined {
    if (this._symbol) {
      return this.parser.getConfigValue(this._symbol);
    } else {
      throw new Error('attempt to get value of non-symbol');
    }
  }

}

class SimpleCondition {
  private rootNode: ConditionNode;

  constructor(parser: KConfigParser, tokens: string[]) {
    if (tokens[0] === 'if') {
      this.rootNode = new ConditionNode(parser, tokens.slice(1));
    }
    else {
      this.rootNode = new ConditionNode(parser, tokens);
    }
  }

  get isEnabled(): boolean {
    return this.rootNode.isTrue;
  }
}

class Select {
  private _target: string;
  private _condition?: SimpleCondition;

  constructor(private parser: KConfigParser, private owner: Config, tokens: string[]) {
    this._target = tokens[0];
    if (tokens[1] === 'if') {
      this._condition = new SimpleCondition(parser, tokens.slice(2));
    }
    this.parser.addSelect(this);
  }

  get target(): string {
    return this._target;
  }

  get isEnabled(): boolean {
    return this.owner.isEnabled && (!this._condition || this._condition.isEnabled);
  }

}

class Imply {
  private _target: string;
  private _condition?: SimpleCondition;

  constructor(private parser: KConfigParser, private owner: Config, tokens: string[]) {
    this._target = tokens[0];
    if (tokens[1] === 'if') {
      this._condition = new SimpleCondition(parser, tokens.slice(2));
    }
    this.parser.addImply(this);
  }

  get target(): string {
    return this._target;
  }

  get isEnabled(): boolean {
    return this.owner.isEnabled && (!this._condition || this._condition.isEnabled);
  }

}

class KConfigItem {
  private _items: KConfigItem[] = [];

  constructor(protected parser: KConfigParser) {
  }

  public parseTokens(tokens: string[], owner: KConfigItem) {
    const items: KConfigItem[] = [];
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token === 'mainmenu') {
        items.push(new MainMenu(this.parser, tokens[++i]));
      }
      else if (token === 'menu') {
        const subTokens: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === 'endmenu') {
            break;
          }
          subTokens.push(token);
        }
        items.push(new Menu(this.parser, subTokens));
      }
      else if (token === 'config') {
        const subTokens: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (['mainmenu', 'menu', 'config', 'choice'].includes(token)) {
            i--;
            break;
          }
          subTokens.push(token);
        }
        items.push(new Config(this.parser, owner, subTokens));
      }
      else if (token === 'choice') {
        const subTokens: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === 'endchoice') {
            break;
          }
          subTokens.push(token);
        }
        items.push(new Choice(this.parser, owner, subTokens));

      }
      else if (token === 'if') {
        const subTokens: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === 'endif') {
            break;
          }
          subTokens.push(token);
        }
        items.push(new Conditional(this.parser, owner, subTokens));
      }
    }

    return [];
  }

  get isPromptEnabled(): boolean {
    return false;
  }

  get isEnabled(): boolean {
    return true;
  }

  get isVisual(): boolean {
    return false;
  }

  get type(): string {
    return 'KConfigItem';
  }
}

class MainMenu extends KConfigItem {
  constructor(parser: KConfigParser, public prompt: string) {
    super(parser);
    console.log('Main Menu', prompt);
  }
}

class ConfigDefault {
  private _value: string;
  private _condition: SimpleCondition | undefined;
  constructor(value: string, condition?: SimpleCondition) {
    this._value = value;
    this._condition = condition;
  }

  get isActive() {
    if (this._condition) {
      return this._condition.isEnabled;
    }
    return true;
  }

  get value() {
    return this._value;
  }
}

class Config extends KConfigItem implements IConfig {
  private _owner: KConfigItem;
  private _name: string;
  private _dataType: ConfigType = ConfigType.String;
  private _prompt?: string;
  private _promptCondition?: SimpleCondition;
  private _help?: string;
  private _dependsOn?: SimpleCondition;
  private _selects: Select[] = [];
  private _Implies: Imply[] = [];
  private _value?: string;
  private _defaults: ConfigDefault[] = [];

  constructor(parser: KConfigParser, owner: KConfigItem, tokens: string[]) {
    super(parser);
    this._owner = owner;
    this._name = tokens[0];
    this.parser.addConfig(this);
    for (let i = 1; i < tokens.length; i++) {
      let token = tokens[i];
      if (Object.values(ConfigType).includes(token as ConfigType)) {
        this._dataType = token as ConfigType;
        const nextToken = tokens[i + 1] ?? '';
        if (nextToken.startsWith('"')) {
          this._prompt = nextToken.substr(1, nextToken.length - 2);
          i++;
          if (!this._owner.isVisual) {
            this.parser.addVisualization(this._prompt, this);
          }
        }
        if (tokens[i + 1] === 'if') {
          i++;
          const condition: string[] = [];
          while (++i < tokens.length) {
            token = tokens[i];
            if (token === '\n') {
              break;
            }
            condition.push(token);
          }
          this._promptCondition = new SimpleCondition(this.parser, condition);
        }
      }
      else if (token === 'prompt') {
        if (i + 1 < token.length) {
          const nextToken = tokens[i + 1];
          this._prompt = nextToken.substr(1, nextToken.length - 2);
          i++;
          if (tokens[i] === 'if') {
            i++;
            const condition: string[] = [];
            while (++i < tokens.length) {
              token = tokens[i];
              if (token === '\n') {
                break;
              }
              condition.push(token);
            }
            this._promptCondition = new SimpleCondition(this.parser, condition);
          }
          if (!this._owner.isVisual) {
            this.parser.addVisualization(this._prompt, this);
          }
        }
      }
      else if (token === 'default') {
        const condition: string[] = [];
        const value = tokens[++i];
        if (tokens[i + 1] === 'if') {
          while (++i < tokens.length) {
            token = tokens[i];
            if (token === '\n') {
              break;
            }
            condition.push(token);
          }
          this._defaults.push(new ConfigDefault(value, new SimpleCondition(this.parser, condition)));
        } else {
          this._defaults.push(new ConfigDefault(value));
        }
      }
      else if (token === 'help') {
        if (i + 1 < tokens.length) {
          this._help = tokens[++i];
        }
      }
      else if (token === 'depends') {
        if (tokens[i + 1] === 'on') {
          i++;
        }
        const condition: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === '\n') {
            break;
          }
          condition.push(token);
        }
        this._dependsOn = new SimpleCondition(this.parser, condition);
      }
      else if (token === 'select') {
        const statement: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === '\n') {
            break;
          }
          statement.push(token);
        }
        this._selects.push(new Select(this.parser, this, statement));
      }
      else if (token === 'implies') {
        const statement: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === '\n') {
            break;
          }
          statement.push(token);
        }
        this._Implies.push(new Imply(this.parser, this, statement));
      }
    }
  }

  get name() {
    return this._name;
  }

  get isPromptEnabled(): boolean {
    if (!this._prompt) {
      return false;
    }
    if (!this._owner.isEnabled) {
      return false;
    }
    if (this._dependsOn && !this._dependsOn.isEnabled) {
      return false;
    }
    if (this._promptCondition && !this._promptCondition.isEnabled) {
      return false;
    }
    return true;
  }

  get isEnabled(): boolean {
    return this._owner.isEnabled && !!(this.value && this.value !== 'n');
  }

  get valueWeight(): number {
    if (!this.isEnabled) {
      return -1;
    }
    if (this._value) {
      return 2;
    }
    if (this.value) { // has default
      return 1;
    }
    return -1;
  }

  get value(): string | undefined {
    if (this._dependsOn && !this._dependsOn.isEnabled) {
      return undefined;
    }
    if (this._value !== undefined) {
      return this._value;
    }
    for (let def of this._defaults) {
      if (def.isActive) {
        return def.value;
      }
    }
    return undefined;
  }

  set value(value: string | undefined) {
    this._value = value;
  }

  get prompt(): string {
    return this._prompt ?? this._name;
  }

  get dataType(): ConfigType  {
    return this._dataType;
  }

  get type(): string {
    return 'Config';
  }
}

class Menu extends KConfigItem {
  private _name: string;

  constructor(parser: KConfigParser, tokens: string[]) {
    super(parser);
    this._name = tokens[0];
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
    }
  }
}

class Choice extends KConfigItem {
  private _owner: KConfigItem;
  private _prompt?: string;
  private _promptCondition?: SimpleCondition;
  private _dependsOn?: SimpleCondition;
  private _configs: Config[] = [];

  constructor(parser: KConfigParser, owner: KConfigItem, tokens: string[]) {
    super(parser);
    this._owner = owner;
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token === 'prompt')  {
        if (i + 1 < token.length) {
          token = tokens[++i];
          this._prompt = token.substr(1, token.length - 2);
          if (tokens[i + 1] === 'if') {
            i++;
            const condition: string[] = [];
            while (++i < tokens.length) {
              token = tokens[i];
              if (token === '\n') {
                break;
              }
              condition.push(token);
            }
            this._promptCondition = new SimpleCondition(this.parser, condition);
          }
          this.parser.addVisualization(this._prompt, this);
        }
      }
      else if (token === 'depends')  {
        if (tokens[i + 1] === 'on') {
          i++;
        }
        const condition: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === '\n') {
            break;
          }
          condition.push(token);
        }
        this._dependsOn = new SimpleCondition(this.parser, condition);
      }
      else if (token === 'config')  {
        const statement: string[] = [];
        while (++i < tokens.length) {
          token = tokens[i];
          if (token === 'config') {
            i--;
            break;
          }
          statement.push(token);
        }
        this._configs.push(new Config(parser, this, statement));
      }
    }
    this._configs[0].value = 'y';
  }

  get isPromptEnabled(): boolean {
    if (!this._prompt) {
      return false;
    }
    if (!this._owner.isEnabled) {
      return false;
    }
    if (this._dependsOn && !this._dependsOn.isEnabled) {
      return false;
    }
    if (this._promptCondition && !this._promptCondition.isEnabled) {
      return false;
    }
    return true;
  }

  get isEnabled(): boolean {
    if (!this._owner.isEnabled) {
      return false;
    }
    if (this._promptCondition) {
      return this._promptCondition.isEnabled
    }
    if (this._dependsOn) {
      return this._dependsOn.isEnabled
    }
    return true;
  }

  get isVisual(): boolean {
    return true;
  }

  get type(): string {
    return 'Choice';
  }

  get configs(): Config[] {
    return this._configs;
  }
}

class Conditional extends KConfigItem {
  private _owner: KConfigItem;
  private _condition: SimpleCondition;

  constructor(parser: KConfigParser, owner: KConfigItem, tokens: string[]) {
    super(parser);
    this._owner = owner;
    let i = -1;
    const condition: string[] = [];
    while (++i < tokens.length) {
      let token = tokens[i];
      if (token === '\n') {
        break;
      }
      condition.push(token);
    }
    this._condition = new SimpleCondition(this.parser, condition);
    this.parseTokens(tokens.slice(i), this);
  }

  get isEnabled(): boolean {
    return this._owner.isEnabled && this._condition.isEnabled;
  }
}

class NamedConfig {
  private _configs: Config[] = [];
  private _selects: Select[] = [];
  private _implies: Imply[] = [];
  private _value: string | undefined;

  constructor(public readonly name: string) {
  }

  addConfig(config: Config) {
    this._configs.push(config);
  }

  addSelect(item: Select) {
    this._selects.push(item);
  }

  addImply(item: Imply) {
    this._implies.push(item);
  }

  get hasConfigs(): boolean {
    return this._configs.length > 0;
  }

  get value(): string | undefined {
    if (this._value) {
      if (this._configs.find(config => config.isPromptEnabled)) {
        return this._value;
      }
    }
    for (let select of this._selects) {
      if (select.isEnabled) {
        return 'y';
      }
    }
    let highestWeight = -1;
    let result: string | undefined = undefined;
    for (let config of this._configs) {
      if (config.valueWeight > highestWeight) {
        highestWeight = config.valueWeight;
        result = config.value;
      }
    }
    if (!result) {
      for (let imply of this._implies) {
        if (imply.isEnabled) {
          return 'y';
        }
      }
    }
    return result;
  }

  set value(value: string | undefined) {
    this._value = value;
  }

  get isEnabled(): boolean {
    if (this._value ) {
      return this._value !== 'n';
    }
    for (let select of this._selects) {
      if (select.isEnabled) {
        return true;
      }
    }
    return !!this._configs.find(config => config.isEnabled);
  }
}

export enum KconfigOptionType {
  Toggle = 'toggle',
  Choice = 'choice',
  Text = 'text',
  Integer = 'integer',
  Hex = 'hex',
}

export interface KconfigChoiceItemn {
  id: string;
  name: string;
}

export class KconfigOption {
  constructor(private parser: KConfigParser, private prompt: string, private item: KConfigItem) {
  }

  get title(): string {
    return this.prompt;
  }

  get type(): KconfigOptionType {
    if (this.item.type === 'Choice') {
      return KconfigOptionType.Choice;
    }
    if (this.item.type === 'Config') {
      const config = this.item as Config
      if (config.dataType === ConfigType.Hex) {
        return KconfigOptionType.Hex;
      }
      if (config.dataType === ConfigType.Integer) {
        return KconfigOptionType.Integer;
      }
      if (config.dataType === ConfigType.String) {
        return KconfigOptionType.Text;
      }
    }
    return KconfigOptionType.Toggle;
  }

  get options(): KconfigChoiceItemn[] {
    if (this.item.type === 'Choice') {
      const choice = this.item as Choice
      return choice.configs.map(config => {
        return {
          id: config.name,
          name: config.prompt
        }
      });
    }
    return [];
  }

  get isEnabled(): boolean {
    return this.item.isPromptEnabled;
  }

  get value(): string {
    if (this.item.type === 'Config') {
      const config = this.item as Config
      if (config.dataType === ConfigType.Hex) {
        return this.parser.getConfigValue(config.name) ?? '0x0';
      }
      if (config.dataType === ConfigType.Integer) {
        return this.parser.getConfigValue(config.name) ?? '42';
      }
      if (config.dataType === ConfigType.String) {
        return this.parser.getConfigValue(config.name) ?? '';
      }
      return this.parser.getConfigValue(config.name) ?? 'n';
    }
    if (this.item.type === 'Choice') {
      const choice = this.item as Choice
      const chosenConfig = choice.configs.find(config => this.parser.getConfigValue(config.name) === 'y');
      return chosenConfig?.name ?? '';
    }
    return '';
  }

  set value(value: string) {
    if (this.item.type === 'Config') {
      const config = this.item as Config
      this.parser.setConfigValue(config.name, value);
    }
    if (this.item.type === 'Choice') {
      const choice = this.item as Choice
      const current = choice.configs.find(config => this.parser.getConfigValue(config.name) === 'y');
      if (current?.name !== value) {
        if (current) {
          this.parser.setConfigValue(current.name, 'n');
        }
        this.parser.setConfigValue(value, 'y');
      }

    }
  }
}

export class KConfigParser {
  private whitespace = /\s/;
  private _root: KConfigItem;
  private _configs: NamedConfig[] = [];
  private _visualizations: KconfigOption[] = [];

  constructor(kconfig: KConfig) {
    const tokens = this.tokenize(kconfig.kconfig);
    this._root = new KConfigItem(this);
    this._root.parseTokens(tokens, new KConfigItem(this));
    this.applyCurrentConfig(kconfig.config);
    // this._configs.forEach(config => {
    //   if (config.isEnabled) {
    //     console.log('CONFIG_' + config.name + '=' + config.value);
    //   }
    // });
  }

  private applyCurrentConfig(config: string) {
    const lines = config.split('\n');
    lines.map(line => line.trim()).forEach(line => {
      if (!line.startsWith('#')) {
        const items = line.split('=');
        const name = items[0].substr('CONFIG_'.length);
        const value = items[1];
        const namedConfig = this._configs.find(existing => existing.name === name);
        if (namedConfig) {
          if (namedConfig.value !== value) {
            namedConfig.value = value;
          }
        }
      }
    });
  }

  addVisualization(prompt: string, item: KConfigItem) {
    this._visualizations.push(new KconfigOption(this, prompt, item));
  }

  addConfig(config: Config) {
    let namedConfig = this._configs.find(existing => existing.name === config.name);
    if (!namedConfig) {
      namedConfig = new NamedConfig(config.name);
      this._configs.push(namedConfig);
    }
    if (!namedConfig.hasConfigs) {
      const index = this._configs.findIndex(existing => existing.name === config.name);
      this._configs.splice(index, 1);
      this._configs.push(namedConfig);
    }
    namedConfig.addConfig(config);
  }

  addSelect(item: Select) {
    let namedConfig = this._configs.find(existing => existing.name === item.target);
    if (!namedConfig) {
      namedConfig = new NamedConfig(item.target);
      this._configs.push(namedConfig);
    }
    namedConfig.addSelect(item);
  }

  addImply(item: Imply) {
    let namedConfig = this._configs.find(existing => existing.name === item.target);
    if (!namedConfig) {
      namedConfig = new NamedConfig(item.target);
      this._configs.push(namedConfig);
    }
    namedConfig.addImply(item);
  }

  getConfigValue(name: string): string | undefined {
    const namedConfig = this._configs.find(config => config.name === name);
    if (namedConfig) {
      return namedConfig.value;
    }
    throw new Error(`config not found ${name}`);
  }

  setConfigValue(name: string, value: string) {
    const namedConfig = this._configs.find(config => config.name === name);
    if (namedConfig) {
      if (namedConfig.value !== value) {
        namedConfig.value = value;
      }
    }
    // console.log('-----------------------------------------------------');
    // console.log('setting ', name, ' to ', value);
    // console.log('-----------------------------------------------------');
    // this._configs.forEach(config => {
    //   if (config.isEnabled) {
    //     console.log('CONFIG_' + config.name + '=' + config.value);
    //   }
    // });
  }

  getConfigEnabled(name: string): boolean {
    const namedConfig = this._configs.find(config => config.name === name);
    if (namedConfig) {
      return namedConfig.isEnabled;
    }
    throw new Error(`config not found ${name}`);
  }

  private tokenize(kconfig: string) {
    const tokens: string[] = [];
    let token = '';

    const chars = [...kconfig];
    for (let i = 0; i < chars.length; i++) {
      let c = chars[i];
      if (c === '"') {
        token += c;
        while (++i < chars.length) {
          c = chars[i];
          token += c;
          if (c === '"') {
            tokens.push(token);
            token = '';
            break;
          }
        }
      }
      else if (c === '#') {
        while (++i < chars.length) {
          c = chars[i];
          if (c === '\n') {
            i--;
            break;
          }
        }
      }
      else if (c === '!') {
        if (token) {
          tokens.push(token);
          token = '';
        }
        if (chars[i + 1] === '=') {
          tokens.push('!=');
          i++;
        } else {
          tokens.push('!');
        }
      }
      else if (c === '(') {
        if (token) {
          tokens.push(token);
          token = '';
        }
        tokens.push('(');
      }
      else if (c === ')') {
        if (token) {
          tokens.push(token);
          token = '';
        }
        tokens.push(')');
      }
      else if (this.whitespace.test(c)) {
        if (token) {
          tokens.push(token);
          if (token === 'help') {
            let help = '';
            let helpIndent = 0;
            i--;
            while (++i < chars.length && chars[i] !== '\n') {} // find first line after help token
            while (i < chars.length) { // read help lines
              let indent = 0;
              while (++i < chars.length) {
                c = chars[i];
                if (this.whitespace.test(c)) {
                  indent++;
                } else {
                  i--;
                  break;
                }
              }
              if (helpIndent === 0) { // first line
                helpIndent = indent;
              }
              if (indent < helpIndent) {
                break;
              }
              while (++i < chars.length) {
                c = chars[i];
                help += c;
                if (c === '\n') {
                  break;
                }
              }
            }
            tokens.push(help);
          }
          else if (c === '\n') {
            tokens.push('\n');
          }
          token = '';
        }
        else if (c === '\n') {
          if (tokens[tokens.length - 1] !== '\n') {
            tokens.push('\n');
          }
        }
      } else {
        token += c;
      }
    }
    return tokens;
  }

  get visualizations(): KconfigOption[] {
    return this._visualizations.filter(visual => visual.isEnabled);
  }

  get configOutput(): string {
    let result = '';
    this._configs.forEach(config => {
      if (config.isEnabled) {
        result += `CONFIG_${config.name}=${config.value}\n`;
      }
    });
    return result;
  }


}
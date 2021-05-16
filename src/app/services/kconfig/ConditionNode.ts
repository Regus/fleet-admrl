import { IKConfigParser } from './KConfigParser.types';

export class ConditionNode {
  private _symbol?: string;
  private _relation?: '||' | '&&' | '!' | '!=' | '=' | '<' | '<=' | '>' | '>=';
  private _leftHand?: ConditionNode;
  private _rightHand?: ConditionNode;

  constructor(private parser: IKConfigParser, private tokens: string[]) {
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
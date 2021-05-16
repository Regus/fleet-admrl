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

export interface IKConfigParser {
  addConfig(config: IConfig): void;
  getConfigValue(name: string): string | undefined;
  getConfigEnabled(name: string): Boolean;
}
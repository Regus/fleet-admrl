
export interface SetupUseCaseActions {
  installTooling(): void;
}

export interface SetupUseCaseModel {
  readonly toolingInstalled: boolean;
  readonly installationInProgress: boolean;
}

export class SetupUseCase {

  constructor(
    private model: SetupUseCaseModel,
    private actions: SetupUseCaseActions,
  ) {

  }

  installTooling() {
    this.actions.installTooling();
  }

  get toolingInstalled(): boolean {
    return this.model.toolingInstalled;
  }

  get installationInProgress(): boolean {
    return this.model.toolingInstalled;
  }

}

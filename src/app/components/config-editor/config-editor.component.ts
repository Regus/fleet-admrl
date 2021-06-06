import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.scss']
})
export class ConfigEditorComponent {
  editorOptions = {theme: 'vs-dark', language: 'ini'};
  @Input() code = '';

  constructor() { }

}

import { Directive, Output, HostListener, EventEmitter } from "@angular/core";
/**
 * Generated class for the KeyPressDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: "[key-press]" // Attribute selector
})

export class KeyPressDirective {
  @Output()
  onKeyPress: EventEmitter<any> = new EventEmitter<any>();

  @HostListener("document:keydown", ["$event"])
  public onListenerTriggered(event: any): void {
    this.onKeyPress.emit(event);
  }
}
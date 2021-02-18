var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Output, HostListener, EventEmitter } from "@angular/core";
/**
 * Generated class for the KeyPressDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
var KeyPressDirective = /** @class */ (function () {
    function KeyPressDirective() {
        this.onKeyPress = new EventEmitter();
    }
    KeyPressDirective.prototype.onListenerTriggered = function (event) {
        this.onKeyPress.emit(event);
    };
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], KeyPressDirective.prototype, "onKeyPress", void 0);
    __decorate([
        HostListener("document:keydown", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], KeyPressDirective.prototype, "onListenerTriggered", null);
    KeyPressDirective = __decorate([
        Directive({
            selector: "[key-press]" // Attribute selector
        })
    ], KeyPressDirective);
    return KeyPressDirective;
}());
export { KeyPressDirective };
//# sourceMappingURL=key-press.js.map
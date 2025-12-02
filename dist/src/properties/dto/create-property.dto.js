"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePropertyDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePropertyDto {
    reference;
    oldReference;
    title;
    showOnSite;
    isExclusive;
    finality;
    value;
    static _OPENAPI_METADATA_FACTORY() {
        return { reference: { required: true, type: () => String }, oldReference: { required: false, type: () => String }, title: { required: true, type: () => String }, showOnSite: { required: true, type: () => Boolean }, isExclusive: { required: true, type: () => Object }, finality: { required: true, type: () => [String] }, value: { required: true, type: () => Number, minimum: 0 } };
    }
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "oldReference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "showOnSite", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], CreatePropertyDto.prototype, "isExclusive", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "finality", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'não pode ser meno que 0' }),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "value", void 0);
//# sourceMappingURL=create-property.dto.js.map
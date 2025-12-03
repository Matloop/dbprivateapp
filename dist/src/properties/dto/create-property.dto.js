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
exports.CreatePropertyDto = exports.PropertyStatus = exports.TransactionType = exports.PropertyCategory = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var PropertyCategory;
(function (PropertyCategory) {
    PropertyCategory["APARTAMENTO"] = "APARTAMENTO";
    PropertyCategory["CASA"] = "CASA";
    PropertyCategory["GALPAO"] = "GALPAO";
    PropertyCategory["SALA_COMERCIAL"] = "SALA_COMERCIAL";
    PropertyCategory["COBERTURA"] = "COBERTURA";
    PropertyCategory["SITIO"] = "SITIO";
    PropertyCategory["VEICULO"] = "VEICULO";
    PropertyCategory["HOTEL"] = "HOTEL";
    PropertyCategory["DIFERENCIADO"] = "DIFERENCIADO";
    PropertyCategory["EMBARCACAO"] = "EMBARCACAO";
    PropertyCategory["TERRENO"] = "TERRENO";
})(PropertyCategory || (exports.PropertyCategory = PropertyCategory = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["VENDA"] = "VENDA";
    TransactionType["LOCACAO"] = "LOCACAO";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["DISPONIVEL"] = "DISPONIVEL";
    PropertyStatus["RESERVADO"] = "RESERVADO";
    PropertyStatus["VENDIDO"] = "VENDIDO";
    PropertyStatus["ALUGADO"] = "ALUGADO";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
class CreateAddressDto {
    street;
    number;
    complement;
    neighborhood;
    city;
    state;
    zipCode;
    static _OPENAPI_METADATA_FACTORY() {
        return { street: { required: true, type: () => String }, number: { required: true, type: () => String }, complement: { required: false, type: () => String }, neighborhood: { required: true, type: () => String }, city: { required: true, type: () => String }, state: { required: true, type: () => String }, zipCode: { required: true, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "complement", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "neighborhood", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "zipCode", void 0);
class CreateImageDto {
    url;
    isCover;
    static _OPENAPI_METADATA_FACTORY() {
        return { url: { required: true, type: () => String }, isCover: { required: false, type: () => Boolean } };
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateImageDto.prototype, "isCover", void 0);
class CreatePaymentConditionDto {
    description;
    value;
    static _OPENAPI_METADATA_FACTORY() {
        return { description: { required: true, type: () => String }, value: { required: false, type: () => Number } };
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentConditionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePaymentConditionDto.prototype, "value", void 0);
class CreatePropertyDto {
    title;
    subtitle;
    category;
    transactionType;
    isExclusive;
    showOnSite;
    exclusivityDocUrl;
    registrationNumber;
    price;
    condoFee;
    iptuPrice;
    bedrooms;
    suites;
    bathrooms;
    garageSpots;
    privateArea;
    totalArea;
    garageArea;
    constructionStartDate;
    deliveryDate;
    description;
    brokerNotes;
    status;
    address;
    propertyFeatures;
    developmentFeatures;
    images;
    paymentConditions;
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String }, subtitle: { required: false, type: () => String }, category: { required: true, enum: require("./create-property.dto").PropertyCategory }, transactionType: { required: false, enum: require("./create-property.dto").TransactionType }, isExclusive: { required: true, type: () => Boolean }, showOnSite: { required: true, type: () => Boolean }, exclusivityDocUrl: { required: false, type: () => String }, registrationNumber: { required: false, type: () => String }, price: { required: true, type: () => Number, minimum: 0 }, condoFee: { required: false, type: () => Number, minimum: 0 }, iptuPrice: { required: false, type: () => Number, minimum: 0 }, bedrooms: { required: false, type: () => Number, minimum: 0 }, suites: { required: false, type: () => Number, minimum: 0 }, bathrooms: { required: false, type: () => Number, minimum: 0 }, garageSpots: { required: false, type: () => Number, minimum: 0 }, privateArea: { required: true, type: () => Number }, totalArea: { required: false, type: () => Number }, garageArea: { required: false, type: () => Number }, constructionStartDate: { required: false, type: () => Date }, deliveryDate: { required: false, type: () => Date }, description: { required: false, type: () => String }, brokerNotes: { required: false, type: () => String }, status: { required: false, enum: require("./create-property.dto").PropertyStatus }, address: { required: false, type: () => CreateAddressDto }, propertyFeatures: { required: false, type: () => [String] }, developmentFeatures: { required: false, type: () => [String] }, images: { required: false, type: () => [CreateImageDto] }, paymentConditions: { required: false, type: () => [CreatePaymentConditionDto] } };
    }
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "subtitle", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PropertyCategory),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TransactionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "transactionType", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "isExclusive", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "showOnSite", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "exclusivityDocUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "registrationNumber", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "condoFee", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "iptuPrice", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bedrooms", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "suites", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "garageSpots", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "privateArea", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "totalArea", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "garageArea", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePropertyDto.prototype, "constructionStartDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePropertyDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "brokerNotes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PropertyStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateAddressDto),
    __metadata("design:type", CreateAddressDto)
], CreatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "propertyFeatures", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "developmentFeatures", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateImageDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePaymentConditionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "paymentConditions", void 0);
//# sourceMappingURL=create-property.dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInsuranceDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_insurance_dto_1 = require("./create-insurance.dto");
class UpdateInsuranceDto extends (0, mapped_types_1.PartialType)(create_insurance_dto_1.CreateInsuranceDto) {
}
exports.UpdateInsuranceDto = UpdateInsuranceDto;
//# sourceMappingURL=update-insurance.dto.js.map
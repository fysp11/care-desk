import { describe, expect, test } from "bun:test";
import type { ArgumentMetadata } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsString, Matches, ValidateNested } from "class-validator";

import { createValidationPipe } from "../src/common/validation.js";
import { CreatePatientDto } from "../src/patients/dto/create-patient.dto.js";
import { ListPatientsDto } from "../src/patients/dto/list-patients.dto.js";
import { UpdatePatientDto } from "../src/patients/dto/update-patient.dto.js";

interface ApiErrorBody {
  readonly code?: string;
  readonly message?: string;
  readonly details?: Record<string, readonly string[]>;
}

class NestedChildDto {
  title!: string;
}

class NestedParentDto {
  child!: NestedChildDto;
}

class UndecoratedDto {}

IsString()(NestedChildDto.prototype, "title");
Matches(/\S/, {
  message: "child title must contain text.",
})(NestedChildDto.prototype, "title");

ValidateNested()(NestedParentDto.prototype, "child");
Type(() => NestedChildDto)(NestedParentDto.prototype, "child");

const bodyMetadata = (
  metatype: ArgumentMetadata["metatype"],
): ArgumentMetadata => ({
  metatype,
  type: "body",
});

const queryMetadata = (
  metatype: ArgumentMetadata["metatype"],
): ArgumentMetadata => ({
  metatype,
  type: "query",
});

const validPatientBody = (
  overrides: Partial<Record<string, string>> = {},
): Record<string, string> => ({
  dob: "1990-03-14",
  email: "nora.frost@example.com",
  firstName: "Nora",
  lastName: "Frost",
  phoneNumber: "+1 555-0199",
  ...overrides,
});

const expectDobValidationError = async (
  metatype: ArgumentMetadata["metatype"],
  dob: string,
): Promise<void> => {
  const pipe = createValidationPipe();

  try {
    await pipe.transform(validPatientBody({ dob }), bodyMetadata(metatype));
  } catch (error) {
    const body = (error as { getResponse: () => ApiErrorBody }).getResponse();

    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message).toBe("Request validation failed.");
    expect(Object.keys(body.details ?? {})).toEqual(["dob"]);
    expect(body.details?.dob).toEqual(["dob must be a valid ISO date."]);
    return;
  }

  throw new Error(`Expected ${dob} to fail dob validation.`);
};

const expectDobValidationMessage = async (
  metatype: ArgumentMetadata["metatype"],
  dob: string,
  message: string,
): Promise<void> => {
  const pipe = createValidationPipe();

  try {
    await pipe.transform(validPatientBody({ dob }), bodyMetadata(metatype));
  } catch (error) {
    const body = (error as { getResponse: () => ApiErrorBody }).getResponse();

    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details?.dob).toContain(message);
    return;
  }

  throw new Error(`Expected ${dob} to fail dob validation.`);
};

const expectFieldValidationMessage = async (
  metatype: ArgumentMetadata["metatype"],
  body: Record<string, unknown>,
  field: string,
  message: string,
  metadata: ArgumentMetadata = bodyMetadata(metatype),
): Promise<void> => {
  const pipe = createValidationPipe();

  try {
    await pipe.transform(body, metadata);
  } catch (error) {
    const response = (
      error as { getResponse: () => ApiErrorBody }
    ).getResponse();

    expect(response.code).toBe("VALIDATION_ERROR");
    expect(response.details?.[field]).toContain(message);
    return;
  }

  throw new Error(`Expected ${field} to fail validation.`);
};

describe("validation pipe", () => {
  test("returns field-keyed details for nested validation children", async () => {
    const pipe = createValidationPipe();

    try {
      await pipe.transform(
        {
          child: {
            title: "",
          },
        },
        bodyMetadata(NestedParentDto),
      );
    } catch (error) {
      const body = (error as { getResponse: () => ApiErrorBody }).getResponse();

      expect(body.code).toBe("VALIDATION_ERROR");
      expect(body.message).toBe("Request validation failed.");
      expect(Object.getPrototypeOf(body.details)).toBeNull();
      expect(body.details?.["child.title"]).toEqual([
        "child title must contain text.",
      ]);
      expect(body.details?.child).toBeUndefined();
      return;
    }

    throw new Error("Expected validation pipe to reject invalid nested input.");
  });

  test("keeps validation pipe strict without transforming DTO output", async () => {
    const pipe = createValidationPipe();
    const body = validPatientBody();

    await expect(
      pipe.transform(body, bodyMetadata(CreatePatientDto)),
    ).resolves.toEqual(body);
    await expect(
      pipe.transform(body, bodyMetadata(CreatePatientDto)),
    ).resolves.not.toBeInstanceOf(CreatePatientDto);

    try {
      await pipe.transform(
        {
          ...body,
          extra: "unexpected",
        },
        bodyMetadata(CreatePatientDto),
      );
    } catch (error) {
      const response = (
        error as { getResponse: () => ApiErrorBody }
      ).getResponse();

      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.details?.extra).toEqual([
        "property extra should not exist",
      ]);
      return;
    }

    throw new Error("Expected extra request fields to fail validation.");
  });

  test("rejects unknown DTOs without validation metadata", async () => {
    const pipe = createValidationPipe();

    try {
      await pipe.transform({}, bodyMetadata(UndecoratedDto));
    } catch (error) {
      const response = (
        error as { getResponse: () => ApiErrorBody }
      ).getResponse();

      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.details?.undefined).toEqual([
        "an unknown value was passed to the validate function",
      ]);
      return;
    }

    throw new Error("Expected undecorated DTOs to fail validation.");
  });

  test("keeps create and update patient date validation in sync", async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        validPatientBody({ dob: "2024-02-29" }),
        bodyMetadata(CreatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ dob: "2024-02-29" }));
    await expect(
      pipe.transform(
        validPatientBody({ dob: "2024-02-29" }),
        bodyMetadata(UpdatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ dob: "2024-02-29" }));
    await expect(
      pipe.transform(
        validPatientBody({ dob: "2000-02-29" }),
        bodyMetadata(CreatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ dob: "2000-02-29" }));
    await expect(
      pipe.transform(
        validPatientBody({ dob: "2000-02-29" }),
        bodyMetadata(UpdatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ dob: "2000-02-29" }));

    await expectDobValidationError(CreatePatientDto, "2025-02-29");
    await expectDobValidationError(UpdatePatientDto, "2025-02-29");
    await expectDobValidationError(CreatePatientDto, "1900-02-29");
    await expectDobValidationError(UpdatePatientDto, "1900-02-29");
    await expectDobValidationMessage(
      CreatePatientDto,
      "02/29/2024",
      "dob must use YYYY-MM-DD format.",
    );
    await expectDobValidationMessage(
      UpdatePatientDto,
      "02/29/2024",
      "dob must use YYYY-MM-DD format.",
    );
    await expectDobValidationMessage(
      CreatePatientDto,
      "x2024-02-29",
      "dob must use YYYY-MM-DD format.",
    );
    await expectDobValidationMessage(
      UpdatePatientDto,
      "2024-02-29x",
      "dob must use YYYY-MM-DD format.",
    );
  });

  test("keeps create and update patient text and phone validation in sync", async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        validPatientBody({ phoneNumber: "555 0199" }),
        bodyMetadata(CreatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ phoneNumber: "555 0199" }));
    await expect(
      pipe.transform(
        validPatientBody({ phoneNumber: "555 0199" }),
        bodyMetadata(UpdatePatientDto),
      ),
    ).resolves.toEqual(validPatientBody({ phoneNumber: "555 0199" }));

    for (const metatype of [CreatePatientDto, UpdatePatientDto]) {
      await expectFieldValidationMessage(
        metatype,
        validPatientBody({ firstName: "   " }),
        "firstName",
        "firstName must contain at least one non-whitespace character.",
      );
      await expectFieldValidationMessage(
        metatype,
        validPatientBody({ lastName: "   " }),
        "lastName",
        "lastName must contain at least one non-whitespace character.",
      );
      await expectFieldValidationMessage(
        metatype,
        validPatientBody({ phoneNumber: "abc +1 555-0199" }),
        "phoneNumber",
        "phoneNumber must be a plausible phone number using digits, spaces, parentheses, hyphens, and an optional leading plus.",
      );
      await expectFieldValidationMessage(
        metatype,
        validPatientBody({ phoneNumber: "+1 555-0199 ext" }),
        "phoneNumber",
        "phoneNumber must be a plausible phone number using digits, spaces, parentheses, hyphens, and an optional leading plus.",
      );
    }
  });

  test("validates patient list query parameters as optional safe strings", async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform({}, queryMetadata(ListPatientsDto)),
    ).resolves.toEqual({});
    await expect(
      pipe.transform(
        {
          limit: "50",
          page: "2",
          search: "Nora Frost",
          sortBy: "email",
          sortDir: "desc",
        },
        queryMetadata(ListPatientsDto),
      ),
    ).resolves.toEqual({
      limit: "50",
      page: "2",
      search: "Nora Frost",
      sortBy: "email",
      sortDir: "desc",
    });

    for (const [field, value, message] of [
      ["page", "0", "page must be a positive safe integer."],
      ["page", "01", "page must be a positive safe integer."],
      ["page", "1abc", "page must be a positive safe integer."],
      ["limit", 10, "limit must be a positive safe integer."],
      [
        "limit",
        String(Number.MAX_SAFE_INTEGER + 1),
        "limit must be a positive safe integer.",
      ],
      [
        "search",
        "x".repeat(121),
        "search must be shorter than or equal to 120 characters",
      ],
      [
        "sortBy",
        "status",
        "sortBy must be one of the following values: firstName, lastName, email, phoneNumber, dob, createdAt, updatedAt",
      ],
      [
        "sortDir",
        "sideways",
        "sortDir must be one of the following values: asc, desc",
      ],
    ] as const) {
      await expectFieldValidationMessage(
        ListPatientsDto,
        { [field]: value },
        field,
        message,
        queryMetadata(ListPatientsDto),
      );
    }
  });
});

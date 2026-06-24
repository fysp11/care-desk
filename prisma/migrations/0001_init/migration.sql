CREATE TABLE "Patient" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "dob" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");
CREATE INDEX "Patient_lastName_firstName_idx" ON "Patient"("lastName", "firstName");
CREATE INDEX "Patient_dob_idx" ON "Patient"("dob");


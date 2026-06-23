# Decomposition rules

## Decompose by reason to change

A module should have one primary reason to change.

Treat a file as a decomposition candidate when it combines responsibilities such
as:

- rendering and domain calculations;
- request handling and database access;
- validation and workflow orchestration;
- persistence and business decisions;
- external API calls and domain policy;
- several unrelated feature behaviors;
- reusable logic and application bootstrapping.

## Good extraction targets

Prefer extracting:

- domain policies;
- calculations and state transitions;
- application use cases;
- validation schemas;
- repository and gateway adapters;
- contract mappers;
- feature-specific hooks;
- cohesive UI components;
- state machines;
- error translation;
- integration clients.

## Invalid extraction patterns

Do not create:

- one-line forwarding wrappers without semantic meaning;
- generic `utils`, `helpers`, `common`, or `misc` dumping grounds;
- interfaces with no boundary or testing value;
- classes used only as namespaces;
- factories with no construction complexity;
- artificial layers that only forward parameters;
- shared abstractions based on coincidental similarity;
- dozens of fragments that require excessive navigation to understand one flow.

## Size and complexity signals

Use these as investigation triggers, not mandatory limits:

- production file above 300 lines;
- UI component above 200 lines;
- function above 50 lines;
- cyclomatic complexity above 10;
- more than three nested control-flow levels;
- module with several unrelated dependency groups;
- file changed for unrelated categories of work.

Large declarative, generated, schema-heavy, or demonstrably cohesive files may
remain large. Document why.

## Naming

Name modules after their owned concept or behavior.

Prefer:

- `calculateInvoiceTotal`;
- `AuthorizeRefund`;
- `OrderRepository`;
- `PaymentGateway`;
- `parseCheckoutRequest`.

Avoid vague names such as:

- `Utils`;
- `CommonService`;
- `Manager`;
- `Processor`;
- `Handler`;
- `BaseHelper`.

Technical suffixes are acceptable only when the domain responsibility remains
clear.

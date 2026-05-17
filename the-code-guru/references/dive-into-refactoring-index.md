# Dive Into Refactoring Index

This reference is a compact operating index for the `the-code-guru` skills. Use it to map local code evidence to the closest Dive Into Refactoring smell category or technique; do not treat this index as a replacement for code-grounded inspection.

## Code Smell Categories

### Bloaters

Smells whose code, methods, classes, or data structures have grown too large to understand and change safely.

- Long Method: a method contains too many lines or too many conceptual steps.
- Large Class: a class contains too many fields, methods, responsibilities, or lines.
- Primitive Obsession: primitive values stand in for concepts that deserve small objects or richer types.
- Long Parameter List: a method requires too many arguments to understand safely.
- Data Clumps: the same group of values travels together across multiple places.

### Object-Orientation Abusers

Smells where object-oriented mechanisms are used awkwardly or avoided where they would simplify change.

- Switch Statements: conditional dispatch is repeated or replaces polymorphic variation.
- Temporary Field: a field is only meaningful under special circumstances.
- Refused Bequest: a subclass inherits behavior or data it does not want.
- Alternative Classes with Different Interfaces: similar responsibilities use incompatible method names or shapes.

### Change Preventers

Smells that make one conceptual change require many edits.

- Divergent Change: one class or module changes for many unrelated reasons.
- Shotgun Surgery: one small change requires edits in many places.
- Parallel Inheritance Hierarchies: adding a class in one hierarchy forces adding a matching class in another.

### Dispensables

Smells where code exists without adding enough value.

- Comments: explanatory comments compensate for unclear code structure or naming.
- Duplicate Code: the same logic or structure appears in multiple places.
- Lazy Class: a class does too little to justify its existence.
- Data Class: a class mainly stores data without behavior or invariants.
- Dead Code: unused code remains in the codebase.
- Speculative Generality: abstractions exist for imagined future needs rather than present pressure.

### Couplers

Smells where code knows too much about other code.

- Feature Envy: one method is more interested in another object than its own object.
- Inappropriate Intimacy: classes depend on each other's internal details.
- Message Chains: callers navigate through chains of objects to reach behavior or data.
- Middle Man: a class delegates too much without adding value.

### Other Smells

- Incomplete Library Class: a library class lacks behavior that the codebase repeatedly needs.

## Refactoring Technique Groups

### Composing Methods

- Extract Method
- Inline Method
- Extract Variable
- Inline Temp
- Replace Temp with Query
- Split Temporary Variable
- Remove Assignments to Parameters
- Replace Method with Method Object
- Substitute Algorithm

### Moving Features between Objects

- Move Method
- Move Field
- Extract Class
- Inline Class
- Hide Delegate
- Remove Middle Man
- Introduce Foreign Method
- Introduce Local Extension

### Organizing Data

- Self Encapsulate Field
- Replace Data Value with Object
- Change Value to Reference
- Change Reference to Value
- Replace Array with Object
- Duplicate Observed Data
- Change Unidirectional Association to Bidirectional
- Change Bidirectional Association to Unidirectional
- Replace Magic Number with Symbolic Constant
- Encapsulate Field
- Encapsulate Collection
- Replace Type Code with Class
- Replace Type Code with Subclasses
- Replace Type Code with State/Strategy
- Replace Subclass with Fields

### Simplifying Conditional Expressions

- Decompose Conditional
- Consolidate Conditional Expression
- Consolidate Duplicate Conditional Fragments
- Remove Control Flag
- Replace Nested Conditional with Guard Clauses
- Replace Conditional with Polymorphism
- Introduce Null Object
- Introduce Assertion

### Simplifying Method Calls

- Rename Method
- Add Parameter
- Remove Parameter
- Separate Query from Modifier
- Parameterize Method
- Replace Parameter with Explicit Methods
- Preserve Whole Object
- Replace Parameter with Method Call
- Introduce Parameter Object
- Remove Setting Method
- Hide Method
- Replace Constructor with Factory Method
- Replace Error Code with Exception
- Replace Exception with Test

### Dealing with Generalization

- Pull Up Field
- Pull Up Method
- Pull Up Constructor Body
- Push Down Method
- Push Down Field
- Extract Subclass
- Extract Superclass
- Extract Interface
- Collapse Hierarchy
- Form Template Method
- Replace Inheritance with Delegation
- Replace Delegation with Inheritance

## Common Smell to Technique Hints

Use these as starting points, then verify against local code.

- Long Method -> Extract Method, Replace Temp with Query, Introduce Parameter Object, Preserve Whole Object, Replace Method with Method Object, Decompose Conditional.
- Large Class -> Extract Class, Extract Subclass, Extract Interface, Duplicate Observed Data.
- Primitive Obsession -> Replace Data Value with Object, Replace Type Code with Class, Replace Type Code with Subclasses, Replace Type Code with State/Strategy, Introduce Parameter Object.
- Long Parameter List -> Introduce Parameter Object, Preserve Whole Object, Replace Parameter with Method Call.
- Data Clumps -> Extract Class, Introduce Parameter Object, Preserve Whole Object.
- Switch Statements -> Replace Conditional with Polymorphism, Replace Type Code with Subclasses, Replace Type Code with State/Strategy, Decompose Conditional.
- Divergent Change -> Extract Class, Move Method, Move Field.
- Shotgun Surgery -> Move Method, Move Field, Inline Class, Hide Delegate.
- Duplicate Code -> Extract Method, Pull Up Method, Form Template Method, Substitute Algorithm.
- Feature Envy -> Move Method, Extract Method.
- Inappropriate Intimacy -> Move Method, Move Field, Change Bidirectional Association to Unidirectional, Hide Delegate.
- Message Chains -> Hide Delegate, Extract Method, Move Method.
- Middle Man -> Remove Middle Man, Inline Method, Inline Class.

## Evidence Rule

When a diagnosis, prescription, or treatment decision depends on a smell or technique, cite the local code evidence and the matching section name from this index. Use this index only to locate candidates quickly.

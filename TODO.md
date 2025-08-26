# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

--

explore ai gateway.

--

migrate business logic and unified ai gateway. to simplified logic and models support

https://vercel.com/blog/ai-gateway-is-now-generally-available
https://vercel.com/ai-gateway/models

--

https://zod.dev/codecs

--

https://zod.dev/v4
Initial parse returned very little content, trying again
💎 Zod 4 is now stable! [Read the announcement.](/v4)

After a year of active development: Zod 4 is now stable! It's faster, slimmer, more `tsc` -efficient, and implements some long-requested features.

## Versioning

To upgrade:

```
npm install zod@^4.0.0
```

For a complete list of breaking changes, refer to the [Migration guide](/v4/changelog). This post focuses on new features & enhancements.

## Why a new major version?

Zod v3.0 was released in May 2021 (!). Back then Zod had 2700 stars on GitHub and 600k weekly downloads. Today it has 37.8k stars and 31M weekly downloads (up from 23M when the beta came out 6 weeks ago!). After 24 minor versions, the Zod 3 codebase had hit a ceiling; the most commonly requested features and improvements require breaking changes.

Zod 4 fixes a number of long-standing design limitations of Zod 3 in one fell swoop, paving the way for several long-requested features and a huge leap in performance. It closes 9 of Zod's [10 most upvoted open issues](https://github.com/colinhacks/zod/issues?q=is%3Aissue%20state%3Aopen%20sort%3Areactions-%2B1-desc). With luck, it will serve as the new foundation for many more years to come.

For a scannable breakdown of what's new, see the table of contents. Click on any item to jump to that section.

## Benchmarks

You can run these benchmarks yourself in the Zod repo:

```
$ git clone [email protected]:colinhacks/zod.git

$ cd zod

$ git switch v4

$ pnpm install
```

Then to run a particular benchmark:

```
$ pnpm bench <name>
```

### 14x faster string parsing

```
$ pnpm bench string

runtime: node v22.13.0 (arm64-darwin)



benchmark      time (avg)             (min … max)       p75       p99      p999

------------------------------------------------- -----------------------------

• z.string().parse

------------------------------------------------- -----------------------------

zod3          363 µs/iter       (338 µs … 683 µs)    351 µs    467 µs    572 µs

zod4       24'674 ns/iter    (21'083 ns … 235 µs) 24'209 ns 76'125 ns    120 µs



summary for z.string().parse

  zod4

   14.71x faster than zod3
```

### 7x faster array parsing

```
$ pnpm bench array

runtime: node v22.13.0 (arm64-darwin)



benchmark      time (avg)             (min … max)       p75       p99      p999

------------------------------------------------- -----------------------------

• z.array() parsing

------------------------------------------------- -----------------------------

zod3          147 µs/iter       (137 µs … 767 µs)    140 µs    246 µs    520 µs

zod4       19'817 ns/iter    (18'125 ns … 436 µs) 19'125 ns 44'500 ns    137 µs



summary for z.array() parsing

  zod4

   7.43x faster than zod3
```

### 6.5x faster object parsing

This runs the [Moltar validation library benchmark](https://moltar.github.io/typescript-runtime-type-benchmarks/).

```
$ pnpm bench object-moltar

benchmark      time (avg)             (min … max)       p75       p99      p999

------------------------------------------------- -----------------------------

• z.object() safeParse

------------------------------------------------- -----------------------------

zod3          805 µs/iter     (771 µs … 2'802 µs)    804 µs    928 µs  2'802 µs

zod4          124 µs/iter     (118 µs … 1'236 µs)    119 µs    231 µs    329 µs



summary for z.object() safeParse

  zod4

   6.5x faster than zod3
```

## 100x reduction in tsc instantiations

Consider the following simple file:

```
import * as z from "zod";



export const A = z.object({

  a: z.string(),

  b: z.string(),

  c: z.string(),

  d: z.string(),

  e: z.string(),

});



export const B = A.extend({

  f: z.string(),

  g: z.string(),

  h: z.string(),

});
```

Compiling this file with `tsc --extendedDiagnostics` using `"zod/v3"` results in >25000 type instantiations. With `"zod/v4"` it only results in ~175.

The Zod repo contains a `tsc` benchmarking playground. Try this for yourself using the compiler benchmarks in `packages/tsc`. The exact numbers may change as the implementation evolves.

```
$ cd packages/tsc

$ pnpm bench object-with-extend
```

More importantly, Zod 4 has redesigned and simplified the generics of `ZodObject` and other schema classes to avoid some pernicious "instantiation explosions". For instance, chaining `.extend()` and `.omit()` repeatedly—something that previously caused compiler issues:

```
import * as z from "zod";



export const a = z.object({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const b = a.omit({

  a: true,

  b: true,

  c: true,

});



export const c = b.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const d = c.omit({

  a: true,

  b: true,

  c: true,

});



export const e = d.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const f = e.omit({

  a: true,

  b: true,

  c: true,

});



export const g = f.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const h = g.omit({

  a: true,

  b: true,

  c: true,

});



export const i = h.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const j = i.omit({

  a: true,

  b: true,

  c: true,

});



export const k = j.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const l = k.omit({

  a: true,

  b: true,

  c: true,

});



export const m = l.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const n = m.omit({

  a: true,

  b: true,

  c: true,

});



export const o = n.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});



export const p = o.omit({

  a: true,

  b: true,

  c: true,

});



export const q = p.extend({

  a: z.string(),

  b: z.string(),

  c: z.string(),

});
```

In Zod 3, this took `4000ms` to compile; and adding additional calls to `.extend()` would trigger a "Possibly infinite" error. In Zod 4, this compiles in `400ms`, `10x` faster.

## 2x reduction in core bundle size

Consider the following simple script.

```
import * as z from "zod";



const schema = z.boolean();



schema.parse(true);
```

It's about as simple as it gets when it comes to validation. That's intentional; it's a good way to measure the _core bundle size_ —the code that will end up in the bundle even in simple cases. We'll bundle this with `rollup` using both Zod 3 and Zod 4 and compare the final bundles.

| Package | Bundle (gzip) |
| ------- | ------------- |
| Zod 3   | `12.47kb`     |
| Zod 4   | `5.36kb`      |

The core bundle is ~57% smaller in Zod 4 (2.3x). That's good! But we can do a lot better.

## Introducing Zod Mini

Zod's method-heavy API is fundamentally difficult to tree-shake. Even our simple `z.boolean()` script pulls in the implementations of a bunch of methods we didn't use, like `.optional()`, `.array()`, etc. Writing slimmer implementations can only get you so far. That's where Zod Mini comes in.

```
npm install zod@^3.25.0
```

It's a Zod variant with a functional, tree-shakable API that corresponds one-to-one with `zod`. Where Zod uses methods, Zod Mini generally uses wrapper functions:

```
import * as z from "zod/mini";



z.optional(z.string());



z.union([z.string(), z.number()]);



z.extend(z.object({ /* ... */ }), { age: z.number() });
```

Not all methods are gone! The parsing methods are identical in Zod and Zod Mini:

```
import * as z from "zod/mini";



z.string().parse("asdf");

z.string().safeParse("asdf");

await z.string().parseAsync("asdf");

await z.string().safeParseAsync("asdf");
```

There's also a general-purpose `.check()` method used to add refinements.

```
import * as z from "zod/mini";



z.array(z.number()).check(

  z.minLength(5),

  z.maxLength(10),

  z.refine(arr => arr.includes(5))

);
```

The following top-level refinements are available in Zod Mini. It should be fairly self-explanatory which Zod methods they correspond to.

```
import * as z from "zod/mini";



// custom checks

z.refine();



// first-class checks

z.lt(value);

z.lte(value); // alias: z.maximum()

z.gt(value);

z.gte(value); // alias: z.minimum()

z.positive();

z.negative();

z.nonpositive();

z.nonnegative();

z.multipleOf(value);

z.maxSize(value);

z.minSize(value);

z.size(value);

z.maxLength(value);

z.minLength(value);

z.length(value);

z.regex(regex);

z.lowercase();

z.uppercase();

z.includes(value);

z.startsWith(value);

z.endsWith(value);

z.property(key, schema); // for object schemas; check \`input[key]\` against \`schema\`

z.mime(value); // for file schemas (see below)



// overwrites (these *do not* change the inferred type!)

z.overwrite(value => newValue);

z.normalize();

z.trim();

z.toLowerCase();

z.toUpperCase();
```

This more functional API makes it easier for bundlers to tree-shake the APIs you don't use. While regular Zod is still recommended for the majority of use cases, any projects with uncommonly strict bundle size constraints should consider Zod Mini.

### 6.6x reduction in core bundle size

Here's the script from above, updated to use `"zod/mini"` instead of `"zod"`.

```
import * as z from "zod/mini";



const schema = z.boolean();

schema.parse(false);
```

When we build this with `rollup`, the gzipped bundle size is `1.88kb`. That's an 85% (6.6x) reduction in core bundle size compared to `zod@3`.

| Package         | Bundle (gzip) |
| --------------- | ------------- |
| Zod 3           | `12.47kb`     |
| Zod 4 (regular) | `5.36kb`      |
| Zod 4 (mini)    | `1.88kb`      |

Learn more on the dedicated [`zod/mini`](/packages/mini) docs page. Complete API details are mixed into existing documentation pages; code blocks contain separate tabs for `"Zod"` and `"Zod Mini"` wherever their APIs diverge.

## Metadata

Zod 4 introduces a new system for adding strongly-typed metadata to your schemas. Metadata isn't stored inside the schema itself; instead it's stored in a "schema registry" that associates a schema with some typed metadata. To create a registry with `z.registry()`:

```
import * as z from "zod";



const myRegistry = z.registry<{ title: string; description: string }>();
```

To add schemas to your registry:

```
const emailSchema = z.string().email();



myRegistry.add(emailSchema, { title: "Email address", description: "..." });

myRegistry.get(emailSchema);

// => { title: "Email address", ... }
```

Alternatively, you can use the `.register()` method on a schema for convenience:

### The global registry

Zod also exports a global registry `z.globalRegistry` that accepts some common JSON Schema-compatible metadata:

```
z.globalRegistry.add(z.string(), {

  id: "email_address",

  title: "Email address",

  description: "Provide your email",

  examples: ["[email protected]"],

  extraKey: "Additional properties are also allowed"

});
```

### .meta()

To conveniently add a schema to `z.globalRegistry`, use the `.meta()` method.

```
z.string().meta({

  id: "email_address",

  title: "Email address",

  description: "Provide your email",

  examples: ["[email protected]"],

  // ...

});
```

## JSON Schema conversion

Zod 4 introduces first-party JSON Schema conversion via `z.toJSONSchema()`.

```
import * as z from "zod";



const mySchema = z.object({name: z.string(), points: z.number()});



z.toJSONSchema(mySchema);

// => {

//   type: "object",

//   properties: {

//     name: {type: "string"},

//     points: {type: "number"},

//   },

//   required: ["name", "points"],

// }
```

Any metadata in `z.globalRegistry` is automatically included in the JSON Schema output.

```
const mySchema = z.object({

  firstName: z.string().describe("Your first name"),

  lastName: z.string().meta({ title: "last_name" }),

  age: z.number().meta({ examples: [12, 99] }),

});



z.toJSONSchema(mySchema);

// => {

//   type: 'object',

//   properties: {

//     firstName: { type: 'string', description: 'Your first name' },

//     lastName: { type: 'string', title: 'last_name' },

//     age: { type: 'number', examples: [ 12, 99 ] }

//   },

//   required: [ 'firstName', 'lastName', 'age' ]

// }
```

Refer to the [JSON Schema docs](/json-schema) for information on customizing the generated JSON Schema.

## Recursive objects

This was an unexpected one. After years of trying to crack this problem, I finally [found a way](https://x.com/colinhacks/status/1919286275133378670) to properly infer recursive object types in Zod. To define a recursive type:

```
const Category = z.object({

  name: z.string(),

  get subcategories(){

    return z.array(Category)

  }

});



type Category = z.infer<typeof Category>;

// { name: string; subcategories: Category[] }
```

You can also represent _mutually recursive types_:

```
const User = z.object({

  email: z.email(),

  get posts(){

    return z.array(Post)

  }

});



const Post = z.object({

  title: z.string(),

  get author(){

    return User

  }

});
```

Unlike the Zod 3 pattern for recursive types, there's no type casting required. The resulting schemas are plain `ZodObject` instances and have the full set of methods available.

```
Post.pick({ title: true })

Post.partial();

Post.extend({ publishDate: z.date() });
```

## File schemas

To validate `File` instances:

```
const fileSchema = z.file();



fileSchema.min(10_000); // minimum .size (bytes)

fileSchema.max(1_000_000); // maximum .size (bytes)

fileSchema.mime(["image/png"]); // MIME type
```

## Internationalization

Zod 4 introduces a new `locales` API for globally translating error messages into different languages.

```
import * as z from "zod";



// configure English locale (default)

z.config(z.locales.en());
```

At the time of this writing only the English locale is available; There will be a call for pull request from the community shortly; this section will be updated with a list of supported languages as they become available.

## Error pretty-printing

The popularity of the [`zod-validation-error`](https://www.npmjs.com/package/zod-validation-error) package demonstrates that there's significant demand for an official API for pretty-printing errors. If you are using that package currently, by all means continue using it.

Zod now implements a top-level `z.prettifyError` function for converting a `ZodError` to a user-friendly formatted string.

```
const myError = new z.ZodError([

  {

    code: 'unrecognized_keys',

    keys: [ 'extraField' ],

    path: [],

    message: 'Unrecognized key: "extraField"'

  },

  {

    expected: 'string',

    code: 'invalid_type',

    path: [ 'username' ],

    message: 'Invalid input: expected string, received number'

  },

  {

    origin: 'number',

    code: 'too_small',

    minimum: 0,

    inclusive: true,

    path: [ 'favoriteNumbers', 1 ],

    message: 'Too small: expected number to be >=0'

  }

]);



z.prettifyError(myError);
```

This returns the following pretty-printable multi-line string:

```
✖ Unrecognized key: "extraField"

✖ Invalid input: expected string, received number

  → at username

✖ Invalid input: expected number, received string

  → at favoriteNumbers[1]
```

Currently the formatting isn't configurable; this may change in the future.

## Top-level string formats

All "string formats" (email, etc.) have been promoted to top-level functions on the `z` module. This is both more concise and more tree-shakable. The method equivalents (`z.string().email()`, etc.) are still available but have been deprecated. They'll be removed in the next major version.

```
z.email();

z.uuidv4();

z.uuidv7();

z.uuidv8();

z.ipv4();

z.ipv6();

z.cidrv4();

z.cidrv6();

z.url();

z.e164();

z.base64();

z.base64url();

z.jwt();

z.lowercase();

z.iso.date();

z.iso.datetime();

z.iso.duration();

z.iso.time();
```

### Custom email regex

The `z.email()` API now supports a custom regular expression. There is no one canonical email regex; different applications may choose to be more or less strict. For convenience Zod exports some common ones.

```
// Zod's default email regex (Gmail rules)

// see colinhacks.com/essays/reasonable-email-regex

z.email(); // z.regexes.email



// the regex used by browsers to validate input[type=email] fields

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email

z.email({ pattern: z.regexes.html5Email });



// the classic emailregex.com regex (RFC 5322)

z.email({ pattern: z.regexes.rfc5322Email });



// a loose regex that allows Unicode (good for intl emails)

z.email({ pattern: z.regexes.unicodeEmail });
```

## Template literal types

Zod 4 implements `z.templateLiteral()`. Template literal types are perhaps the biggest feature of TypeScript's type system that wasn't previously representable.

```
const hello = z.templateLiteral(["hello, ", z.string()]);

// \`hello, ${string}\`



const cssUnits = z.enum(["px", "em", "rem", "%"]);

const css = z.templateLiteral([z.number(), cssUnits]);

// \`${number}px\` | \`${number}em\` | \`${number}rem\` | \`${number}%\`



const email = z.templateLiteral([

  z.string().min(1),

  "@",

  z.string().max(64),

]);

// \`${string}@${string}\` (the min/max refinements are enforced!)
```

Every Zod schema type that can be stringified stores an internal regex: strings, string formats like `z.email()`, numbers, boolean, bigint, enums, literals, undefined/optional, null/nullable, and other template literals. The `z.templateLiteral` constructor concatenates these into a super-regex, so things like string formats (`z.email()`) are properly enforced (but custom refinements are not!).

Read the [template literal docs](/api#template-literals) for more info.

## Number formats

New numeric "formats" have been added for representing fixed-width integer and float types. These return a `ZodNumber` instance with proper minimum/maximum constraints already added.

```
z.int();      // [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],

z.float32();  // [-3.4028234663852886e38, 3.4028234663852886e38]

z.float64();  // [-1.7976931348623157e308, 1.7976931348623157e308]

z.int32();    // [-2147483648, 2147483647]

z.uint32();   // [0, 4294967295]
```

Similarly the following `bigint` numeric formats have also been added. These integer types exceed what can be safely represented by a `number` in JavaScript, so these return a `ZodBigInt` instance with the proper minimum/maximum constraints already added.

```
z.int64();    // [-9223372036854775808n, 9223372036854775807n]

z.uint64();   // [0n, 18446744073709551615n]
```

## Stringbool

The existing `z.coerce.boolean()` API is very simple: falsy values (`false`, `undefined`, `null`, `0`, `""`, `NaN` etc) become `false`, truthy values become `true`.

This is still a good API, and its behavior aligns with the other `z.coerce` APIs. But some users requested a more sophisticated "env-style" boolean coercion. To support this, Zod 4 introduces `z.stringbool()`:

```
const strbool = z.stringbool();



strbool.parse("true")         // => true

strbool.parse("1")            // => true

strbool.parse("yes")          // => true

strbool.parse("on")           // => true

strbool.parse("y")            // => true

strbool.parse("enabled")      // => true



strbool.parse("false");       // => false

strbool.parse("0");           // => false

strbool.parse("no");          // => false

strbool.parse("off");         // => false

strbool.parse("n");           // => false

strbool.parse("disabled");    // => false



strbool.parse(/* anything else */); // ZodError<[{ code: "invalid_value" }]>
```

To customize the truthy and falsy values:

```
z.stringbool({

  truthy: ["yes", "true"],

  falsy: ["no", "false"]

})
```

Refer to the [`z.stringbool()` docs](/api#stringbools) for more information.

## Simplified error customization

The majority of breaking changes in Zod 4 involve the _error customization_ APIs. They were a bit of a mess in Zod 3; Zod 4 makes things significantly more elegant, to the point where I think it's worth highlighting here.

Long story short, there is now a single, unified `error` parameter for customizing errors, replacing the following APIs:

Replace `message` with `error`. (The `message` parameter is still supported but deprecated.)

```
- z.string().min(5, { message: "Too short." });

+ z.string().min(5, { error: "Too short." });
```

Replace `invalid_type_error` and `required_error` with `error` (function syntax):

```
// Zod 3

- z.string({

-   required_error: "This field is required"

-   invalid_type_error: "Not a string",

- });



// Zod 4

+ z.string({ error: (issue) => issue.input === undefined ?

+  "This field is required" :

+  "Not a string"

+ });
```

Replace `errorMap` with `error` (function syntax):

```
// Zod 3

- z.string({

-   errorMap: (issue, ctx) => {

-     if (issue.code === "too_small") {

-       return { message: \`Value must be >${issue.minimum}\` };

-     }

-     return { message: ctx.defaultError };

-   },

- });



// Zod 4

+ z.string({

+   error: (issue) => {

+     if (issue.code === "too_small") {

+       return \`Value must be >${issue.minimum}\`

+     }

+   },

+ });
```

## Upgraded z.discriminatedUnion()

Discriminated unions now support a number of schema types not previously supported, including unions and pipes:

```
const MyResult = z.discriminatedUnion("status", [

  // simple literal

  z.object({ status: z.literal("aaa"), data: z.string() }),

  // union discriminator

  z.object({ status: z.union([z.literal("bbb"), z.literal("ccc")]) }),

  // pipe discriminator

  z.object({ status: z.literal("fail").transform(val => val.toUpperCase()) }),

]);
```

Perhaps most importantly, discriminated unions now _compose_ —you can use one discriminated union as a member of another.

```
const BaseError = z.object({ status: z.literal("failed"), message: z.string() });



const MyResult = z.discriminatedUnion("status", [

  z.object({ status: z.literal("success"), data: z.string() }),

  z.discriminatedUnion("code", [

    BaseError.extend({ code: z.literal(400) }),

    BaseError.extend({ code: z.literal(401) }),

    BaseError.extend({ code: z.literal(500) })

  ])

]);
```

## Multiple values in z.literal()

The `z.literal()` API now optionally supports multiple values.

```
const httpCodes = z.literal([ 200, 201, 202, 204, 206, 207, 208, 226 ]);



// previously in Zod 3:

const httpCodes = z.union([

  z.literal(200),

  z.literal(201),

  z.literal(202),

  z.literal(204),

  z.literal(206),

  z.literal(207),

  z.literal(208),

  z.literal(226)

]);
```

## Refinements live inside schemas

In Zod 3, they were stored in a `ZodEffects` class that wrapped the original schema. This was inconvenient, as it meant you couldn't interleave `.refine()` with other schema methods like `.min()`.

```
z.string()

  .refine(val => val.includes("@"))

  .min(5);

// ^ ❌ Property 'min' does not exist on type ZodEffects<ZodString, string, string>
```

In Zod 4, refinements are stored inside the schemas themselves, so the code above works as expected.

```
z.string()

  .refine(val => val.includes("@"))

  .min(5); // ✅
```

### .overwrite()

The `.transform()` method is extremely useful, but it has one major downside: the output type is no longer _introspectable_ at runtime. The transform function is a black box that can return anything. This means (among other things) there's no sound way to convert the schema to JSON Schema.

```
const Squared = z.number().transform(val => val ** 2);

// => ZodPipe<ZodNumber, ZodTransform>
```

Zod 4 introduces a new `.overwrite()` method for representing transforms that _don't change the inferred type_. Unlike `.transform()`, this method returns an instance of the original class. The overwrite function is stored as a refinement, so it doesn't (and can't) modify the inferred type.

```
z.number().overwrite(val => val ** 2).max(100);

// => ZodNumber
```

## An extensible foundation: zod/v4/core

While this will not be relevant to the majority of Zod users, it's worth highlighting. The addition of Zod Mini necessitated the creation of a shared sub-package `zod/v4/core` which contains the core functionality shared between Zod and Zod Mini.

I was resistant to this at first, but now I see it as one of Zod 4's most important features. It lets Zod level up from a simple library to a fast validation "substrate" that can be sprinkled into other libraries.

If you're building a schema library, refer to the implementations of Zod and Zod Mini to see how to build on top of the foundation `zod/v4/core` provides. Don't hesitate to get in touch in GitHub discussions or via [X](https://x.com/colinhacks) / [Bluesky](https://bsky.app/profile/colinhacks.com) for help or feedback.

## Wrapping up

I'm planning to write up a series of additional posts explaining the design process behind some major features like Zod Mini. I'll update this section as those get posted.

For library authors, there is now a dedicated guide that describes the best practices for building on top of Zod. It answers common questions about how to support Zod 3 & Zod 4 (including Mini) simultaneously.

```
pnpm upgrade zod@latest
```

Happy parsing!
— Colin McDonnell [@colinhacks](https://x.com/colinhacks) [Migration guide](/v4/changelog)

[

Complete changelog and migration guide for upgrading from Zod 3 to Zod 4

](/v4/changelog)

--

https://nextjs.org/blog/next-15-5

Next.js 15.5 includes Turbopack builds in beta, stable Node.js middleware, TypeScript improvements, `next lint` deprecation, and deprecation warnings for Next.js 16. Highlights for this release include:

- [**Turbopack Builds (beta)**](/blog/next-15-5#turbopack-builds-beta): Production turbopack builds (`next build --turbopack`) now in beta
- [**Node.js Middleware (stable)**](/blog/next-15-5#nodejs-middleware-stable): Node.js runtime support for middleware is now stable
- [**TypeScript Improvements**](/blog/next-15-5#typescript-improvements): Typed routes, route export validation, and route types helpers
- [**`next lint`**](/blog/next-15-5#next-lint-deprecation): Deprecation of `next lint` command
- [**Next.js 16**](/blog/next-15-5#deprecation-warnings-for-nextjs-16): Deprecation warnings for Next.js 16

Upgrade today, or get started with:

terminal

```
# Use the automated upgrade CLI

npx @next/codemod@canary upgrade latest



# ...or upgrade manually

npm install next@latest react@latest react-dom@latest



# ...or start a new project

npx create-next-app@latest
```

## Turbopack Builds (beta)

We're excited to announce `next build --turbopack` in beta. Turbopack now powers Vercel websites including [vercel.com](http://vercel.com), [v0.app](http://v0.app), and [nextjs.org](http://nextjs.org), accelerating iteration velocity through faster preview and production deployment builds.

These applications powered by Turbopack have been battle tested serving over **1.2 billion** requests since the rollout.

### Performance & Production Results

One of the original design goals for Turbopack was to be able to help developers scale build performance as their applications and codebases grow. To achieve this, Turbopack was designed from the ground up to take advantage of multiple CPU cores throughout all phases of the build.

We've deployed builds with Turbopack across many Vercel products and saw consistent improvements in compilation time:

- **Customer site**: 2x faster on a 4 core machine
- **Customer site**: 2.2x faster on a 14 core machine
- **Small site (10K modules)**: 4x faster on a 30 core machine
- **Medium site (40K modules)**: 2.5x faster on a 30 core machine
- **Large site (70K modules)**: 5x faster on a 30 core machine

As we rolled out Turbopack to our major web applications, we closely monitored for production performance regressions and breakages.

When compared with Webpack, our production metrics monitoring shows that sites built with Turbopack serve similar or smaller amounts of JavaScript and CSS across fewer requests, leading to comparable or better FCP, LCP and TTFB metrics.

For teams that have adopted Turbopack in development, we now recommend trying Turbopack for builds.

### Known Differences

**Smaller projects**: On smaller machines or smaller projects, we measured marginal or neutral improvements to the build times due to Webpack's built-in persistent cache. We are currently working on a [Persistent Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackPersistentCaching) solution for Turbopack to deliver on our design goal of making all builds incremental and fast.

**Bundle optimization**: In some edge cases, we measured that webpack produced more optimized bundles. We are tracking those scenarios and are working on closing the gap before the stable release. See the [documentation on bundle sizes](https://nextjs.org/docs/app/api-reference/turbopack#bundle-sizes) for more information.

**CSS ordering**: Due to different heuristics about side-effects handling in Turbopack, CSS files can be concatenated in a different order than webpack, leading to potential visual differences. See [the documentation](https://nextjs.org/docs/app/api-reference/turbopack#css-module-ordering) for a more detailed explanation and suggested solutions.

> **Note**: These differences are documented and we're actively working on improvements. For detailed information and workarounds, see our [Turbopack documentation](https://nextjs.org/docs/app/api-reference/turbopack#known-gaps-with-webpack).

As we iterate towards the stable release, please report any issues on [GitHub](https://github.com/vercel/next.js/discussions/77721).

## Node.js Middleware (stable)

After introducing experimental support for the Node.js runtime in our [15.2 release](/blog/next-15-2) and testing extensively on our production applications, we're excited to announce stable support for Node.js middleware runtime.

Previously, Next.js middleware only supported the Edge Runtime, which provided better performance and isolation but had limitations when integrating with Node.js-specific libraries and APIs.

This change enables middleware to handle more complex use cases while maintaining the same developer experience.

Although Node.js runtime won't be the default in Next.js 16, we are exploring making it the default starting with Next.js 17 based on community feedback and usage patterns.

## TypeScript Improvements

Next.js 15.5 brings major TypeScript improvements to the App Router, with full Turbopack compatibility and comprehensive type safety for routing.

### Typed Routes (stable)

Typed routes provide compile-time type safety for your application's routes, catching invalid links before they reach production. This feature automatically generates types based on your file structure, ensuring that every `<Link>` component points to a valid route.

This feature is available behind the `typedRoutes` flag, which was previously experimental and is now stable. Statically typed routes now work with Turbopack through a new implementation that provides type safety across both Webpack and Turbopack builds:

next.config.ts

```
const nextConfig = {

  typedRoutes: true, // Now stable!

};



export default nextConfig;
```

```
import Link from 'next/link'



// Full type safety for route paths

<Link href="/blog/example-slug?ui=dark">Read Post</Link>



// TypeScript catches invalid routes at compile time

<Link href="/invalid-route">Broken Link</Link> // ← Type error
```

### Route Export Validation (Turbopack)

Route export validation also works on Turbopack through a new system that generates a type guard file, validating pages, layouts, and route handlers using TypeScript's `satisfies` operator.

This catches invalid exports like incorrect `dynamic` values during compilation when running `next build`, replacing the old Webpack plugin with a more performant solution that works across both build systems.

### Route Props Helpers

Next.js automatically generates globally available `PageProps`, `LayoutProps`, and `RouteContext` types with full parameter typing and no imports required:

**Before: Manual typing and imports**

```
import { Metadata } from 'next';



interface Props {

  params: Promise<{ slug: string }>;

  children: React.ReactNode;

  analytics: React.ReactNode; // Manual parallel route typing

  team: React.ReactNode; // Manual parallel route typing

}



export default function DashboardLayout(props: Props) {

  return (

    <div>

      {props.children}

      {props.analytics} {/* No type safety for parallel routes */}

      {props.team} {/* No type safety for parallel routes */}

    </div>

  );

}
```

**After: Automatic typing with parallel route support**

```
// No need to import LayoutProps - globally available

export default function DashboardLayout(props: LayoutProps<'/dashboard'>) {

  return (

    <div>

      {props.children}

      {props.analytics} {/* Fully typed parallel route slot */}

      {props.team} {/* Fully typed parallel route slot */}

    </div>

  );

}
```

The system automatically discovers routes from your file structure, supporting dynamic routes, parallel routes, and custom routes from `next.config.js`. Type generation runs in both development and build modes, immediately regenerating types when your file structure changes in development, and scales efficiently to large projects by generating only a few optimized files instead of the many individual files used in the previous implementation.

We've added a `next typegen` command for manual type generation without running `next dev` or `next build`. This is particularly useful for external type validation scenarios.

terminal

```
next typegen [directory]
```

Previously, route types were only generated during `next dev` or `next build`, which meant running `tsc --noEmit` directly wouldn't validate your route types. Now you can generate types independently and validate them externally:

terminal

```
# Generate route types first, then validate with TypeScript

next typegen && tsc --noEmit



# Or in CI workflows for type checking without building

next typegen && npm run type-check
```

Starting with Next.js 15.5, the `next lint` command shows a deprecation warning and will be removed in Next.js 16. This modernizes the linting experience by transitioning to explicit ESLint configurations and introducing Biome as a fast alternative.

When creating a new Next.js project, you can now choose between ESLint (comprehensive rules), Biome (fast with fewer rules), or no linter. ESLint projects now generate explicit `eslint.config.mjs` files instead of relying on the `next lint` command wrapper, providing complete transparency into your linting rules.

Biome projects receive optimized configurations with Next.js and React rules plus built-in formatting capabilities. Generated `package.json` scripts now call linters directly:

```
{

  "scripts": {

    // ESLint projects

    "lint": "eslint", // Instead of "next lint"

    "lint:fix": "eslint --fix",



    // For Biome projects

    "lint": "biome check",

    "format": "biome format --write"

  }

}
```

For existing projects, a new codemod automates the migration from `next lint` to ESLint CLI:

terminal

```
npx @next/codemod@latest next-lint-to-eslint-cli .
```

The codemod intelligently transforms `package.json` scripts while preserving functionality, mapping Next.js-specific flags like `--strict` to `--max-warnings 0`, and automatically installing required dependencies.

This transition gives developers direct control over their linting setup with better ecosystem compatibility.

> **Note**: `next build` will still run a linting validation step if an ESLint config is present. This automatic linting during builds will also be removed in Next.js 16, giving you complete control over when and how linting runs.

## Deprecation Warnings for Next.js 16

Next.js 15.5 introduces deprecation warnings to help you prepare for the upcoming Next.js 16 release. These warnings appear in development and build logs, giving you time to migrate before these features are removed.

### legacyBehavior for next/link

The `legacyBehavior` prop for `next/link` will be removed in Next.js 16. This prop was introduced as a temporary compatibility layer during the Next.js 12 to 13 transition.

```
// ❌ Will be removed in Next.js 16

<Link href="/about" legacyBehavior>

  <a>About</a>

</Link>



// ✅ Modern approach (no changes needed)

<Link href="/about">About</Link>
```

**Migration**: Remove the `legacyBehavior` prop and any child `<a>` elements. The `Link` component now handles styling and accessibility automatically.

### AMP Support

Next.js AMP support will be removed in Next.js 16. AMP adoption has declined significantly, and maintaining this feature adds complexity to the framework. All AMP-related APIs and configurations will be removed.

pages/amp-page.js

```
// ❌ Will be removed in Next.js 16

import { useAmp } from 'next/amp';



export const config = { amp: true };



export default function AmpPage() {

  const isAmp = useAmp();

  return <div>AMP Page: {isAmp ? 'AMP' : 'HTML'}</div>;

}
```

next.config.ts

```
const nextConfig = {

  amp: {

    // ❌ Will be removed in Next.js 16

    canonicalBase: 'https://example.com',

  },

};



export default nextConfig;
```

**Migration**: Remove all AMP-related code including:

- `export const config = { amp: true }` from pages
- `amp` configuration from your `next.config.ts`
- `next/amp` hook imports and usage (`useAmp`)
- Any other AMP-specific APIs

Evaluate if AMP is still necessary for your use case. Most performance benefits can now be achieved through Next.js's built-in optimizations and modern web standards.

### next/image Quality Settings

Starting in Next.js 16, the `quality` prop will be restricted to only `75` by default. Currently in Next.js 15, you can use any integer from 1 to 100, but Next.js 16 will require explicit configuration for qualities other than 75.

```
// ⚠️ Will show deprecation warning in Next.js 15.5

// when images.qualities is undefined and quality !== 75

<Image src="/photo.jpg" quality={100} alt="Photo" />



// ✅ Explicit configuration required for Next.js 16
```

next.config.ts

```
const nextConfig = {

  images: {

    qualities: [75, 100], // Explicitly allow quality={100}

  },

};



export default nextConfig;
```

**Migration**: If you use `quality` props other than 75, explicitly configure `images.qualities` in your `next.config.ts` to include the quality values you need for Next.js 16.

### next/image Local Patterns

Starting in Next.js 16, using query strings with local image `src` paths will require explicit configuration in `images.localPatterns`. This affects images with query parameters like cache-busting or versioning.

```
// ⚠️ Will show deprecation warning in Next.js 15.5

// when images.localPatterns is not configured

<Image src="/photo.jpg?v=1" alt="Test" />



// ✅ Explicit configuration required for Next.js 16
```

next.config.ts

```
const nextConfig = {

  images: {

    localPatterns: [

      {

        pathname: '/photo.jpg', // allow exact path

        // omitting "search" will allow all query parameters

      },

      {

        pathname: '/photo.jpg', // allow exact path

        search: '?v=1', // allow exact query parameters

      },

      {

        pathname: '/assets/**', // allow wildcard path

        search: '', // empty search will block all query parameters

      },

    ],

  },

};



export default nextConfig;
```

**Migration**: Configure `images.localPatterns` in your `next.config.ts` to explicitly allow query strings in your image paths. This provides better security and performance optimization.

### Timeline

These deprecation warnings will appear starting with Next.js 15.5. The features will be completely removed in Next.js 16. We recommend migrating as soon as possible to avoid issues during the upgrade.

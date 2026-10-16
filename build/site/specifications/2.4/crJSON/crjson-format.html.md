# Content Credentials JSON (crJSON) File Format Specification

[![Creative Commons License](_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

<a id="_scope"></a>
## 1\. Scope

This document describes a JSON serialization for Content Credentials (aka a C2PA manifest store) known as the **Content Credentials JSON** format (abbreviated **crJSON**). Its purpose is to provide a JSON-based representation of a C2PA manifest store with associated validation results for profile evaluation, interoperability testing, and validation reporting. This JSON representation is not intended to be a canonical source of cryptographic truth, or a general purpose machine readable Content Credentials format, but rather a derived view over C2PA data that is useful for export and interoperability purposes. It is not intended to be used as an input format for C2PA data, and it is not intended to be a lossless representation of all C2PA data. It is simply a specific JSON-LD serialization of information contained in a C2PA manifest store and its associated validation results.

<a id="_relationship_to_the_content_credentials_technical_specification"></a>
## 2\. Relationship to the Content Credentials Technical Specification

crJSON does not replace C2PA claims, JUMBF, or COSE structures. Instead, it is a **derived JSON view** over C2PA data, and not independently verifiable.

```text
C2PA Asset/Manifest Store
  -> Manifest extraction
  -> Validation
  -> crJSON transformation
       |- @context
       |- manifests[]
       |    |- label
       |    |- assertions{...}
       |    |- claim or claim.v2 (one required)
       |    |- signature (required)
       |    |- validationResults (required)
       |    |- ingredientDeltas (optional)
       |- jsonGenerator
```

<a id="_serialization_requirements"></a>
## 3\. Serialization Requirements

<a id="_root_object"></a>
### 3.1. Root Object

A crJSON document shall be a JSON-LD object.

The following top-level properties are used:

| Property | Presence | Description |
| --- | --- | --- |
| `@context` | REQUIRED | JSON-LD context. Schema allows object or array of URI strings. |
| `manifests` | REQUIRED | Array of manifest objects. Each item conforms to the manifest definition (required: label, assertions, signature, validationResults; one of claim or claim.v2). |
| `jsonGenerator` | REQUIRED | Information about the creation of the crJSON object itself, including the creator and time of creation. |

<a id="_context"></a>
### 3.2. `@context`

crJSON uses a standard [JSON-LD serialisation](https://www.w3.org/TR/json-ld11/), and therefore shall contain a JSON-LD standard `@context` field whose value shall be either an object or an array listing terms (also known as namespaces) that are used in the crJSON. In the case of an object, the terms shall be listed as key-value pairs, where the key is the term name and the value is the URI of the term. As described in clause 4.1.2 of JSON-LD, the `@vocab` key can be used for the default vocabulary, as shown in [Example of an object-based JSON-LD `@context` field](#json-ld-context-obj-example). In the case of an array, only the URI is required since it shall apply to all terms not otherwise identified by a specific term, as shown in [Example of an array-based JSON-LD `@context` field](#json-ld-context-array-example).

Example of an object-based JSON-LD `@context` field

```json
{
  "@context": {
    "@vocab": "https://c2pa.org/crjson/",
    "extras": "https://c2pa.org/crjson/extras/",
  }
}
```

Example of an array-based JSON-LD `@context` field

```json
{
  "@context": [
    "https://c2pa.org/crjson/"
  ]
}
```

Since crJSON may contain values that are specific to a given workflow, it is important that each one of these terms shall be defined in the `@context` field. This allows the crJSON document to be self-describing and non-conflicting ensuring that any consumer of the crJSON can understand the meaning of each term.

Since a `@context` element can appear inside of any object in JSON-LD, it is possible to have custom values, and their associated `@context` elements in multiple places throughout a single JSON-LD document, where the terms are localized to that specific object.

<a id="_jsongenerator"></a>
### 3.3. `jsonGenerator`

The `jsonGenerator` field is an object that contains information about the tool that generated the crJSON document. It shall contain the following fields:

*   `name` (required): the name of the tool that generated the crJSON document
    
*   `version` (required): the version of the tool that generated the crJSON document, in SemVer 2.0 format
    

<a id="_manifests"></a>
### 3.4. Manifests

A C2PA Manifest consists of, at least, a set of Assertions, Claims, and Claim Signatures that are bound together into a single entity. For all C2PA Manifests present in the C2PA Manifest Store, they shall be present in the `manifests` array. The order of the Manifests in the array shall match the reverse order that they are found in the Manifest Store, so that the active manifest is always first (i.e., `manifests[0]`).

Each manifest object shall include the following properties (per schema: required `label`, `assertions`, `signature`; exactly one of `claim` or `claim.v2`):

*   `label` (manifest label/URN)
    
*   `assertions` (object keyed by assertion label)
    
*   `claim` (v1, per C2PA `claim-map`) or `claim.v2` (v2, per C2PA `claim-map-v2`)
    
*   `signature` (signature and credential details object)
    
*   `validationResults` (optional per-manifest validation status code groups)
    
*   `ingredientDeltas` (optional per-manifest ingredient validation deltas)
    

The `label` field’s value is a string that identifies the C2PA Manifest using the label of its JUMBF box, such as `urn:c2pa:2702fc84-a1ae-44d1-9825-dd86311e980b`.

The manifest object does not allow additional properties (schema `additionalProperties: false`).

<a id="_claims"></a>
### 3.5. Claims

<a id="_general"></a>
#### 3.5.1. General

A Claim shall be serialised in the same manner as a [CBOR serialised assertion](#cbor_serialised_assertions). It shall be named based on the label of the claim box (e.g., `claim` or `claim.v2`). An example is found in [A JSON-LD serialised claim](#json-ld-claim).

If either of the `gathered_assertions` or `redacted_assertions` fields are not present, then the corresponding JSON field shall be present, and their respective values shall be an empty array.

A JSON-LD serialised claim

```json
"claim.v2": {
  "dc:title": "MIPAMS test image",
  "instanceID": "uuid:7b57930e-2f23-47fc-affe-0400d70b738d",
  "claim_generator": "MIPAMS GENERATOR 0.1",
  "alg": "SHA-256",
  "signature": "self#jumbf=c2pa.signature",
  "created_assertions": [
    {
      "url": "self#jumbf=c2pa.assertions/c2pa.actions.v2",
      "hash": "APqpWkPm91k98DD03sIQ+uYGspG+bxdy0c7+FMu8puU="
    },
    {
      "url": "self#jumbf=c2pa.assertions/c2pa.hash.data",
      "hash": "A8wNdhjiIyOOkGg8+GkJRSYJALG6orPQJRQKMFtq/rc="
    }
  ],
  "gathered_assertions": [],
  "redacted_assertions": []
},
```

<a id="_claim_v2_v2_claim"></a>
#### 3.5.2. `claim.v2` (v2 claim)

`claim.v2` conforms to the C2PA CDDL claim-map-v2. Required properties:

*   `instanceID` — uniquely identifies a specific version of an asset
    
*   `claim_generator_info` — single generator-info map (object with e.g. `name`, `version`, optional `icon`, `operating_system`)
    
*   `signature` — JUMBF URI reference to the signature of this claim (e.g. `self#jumbf=/c2pa/{label}/c2pa.signature`)
    
*   `created_assertions` — array of one or more hashed URI maps; each entry has `url`, `hash`, and optionally `alg`
    

Optional properties:

*   `gathered_assertions` — array of hashed URI maps (same structure as created\_assertions)
    
*   `dc:title` — name of the asset
    
*   `redacted_assertions` — array of JUMBF URI strings (references to redacted ingredient manifest assertions)
    
*   `alg` — cryptographic hash algorithm for data hash assertions (e.g. `SHA-256`)
    
*   `alg_soft` — algorithm for soft binding assertions
    
*   `specVersion` — specification version (SemVer)
    
*   `metadata` — (DEPRECATED) additional information
    

All `hash` values in hashed URI maps shall be Base64 strings with `b64'` prefix.

<a id="_claim_v1_claim"></a>
#### 3.5.3. `claim` (v1 claim)

When a manifest uses `claim` instead of `claim.v2`, it conforms to the C2PA CDDL claim-map (claimV1). Required properties:

*   `claim_generator` — User-Agent string for the claim generator
    
*   `claim_generator_info` — array of one or more generator-info maps
    
*   `signature` — JUMBF URI reference to the signature
    
*   `assertions` — array of one or more hashed URI maps (`url`, `hash`, optional `alg`)
    
*   `dc:format` — media type of the asset
    
*   `instanceID` — uniquely identifies a specific version of an asset
    

Optional: `dc:title`, `redacted_assertions` (JUMBF URI strings), `alg`, `alg_soft`, `metadata`.

All `hash` values in hashed URI maps shall be Base64 strings with b64' prefix.

<a id="_assertions"></a>
### 3.6. Assertions

<a id="assertions-fields"></a>
#### 3.6.1. General

Each manifest object shall contain an `assertions` field whose value is an object keyed by assertion label. Each individual assertion shall be represented as an object, where the key is the label of the Assertion, and the value is an object containing the JSON-LD serialization derived from that Assertion. If it is not possible to derive information from an assertion, then the key shall be present in the assertions object, but its value shall be an empty object. Additionally, a generator may choose not to decode [custom assertions](#custom_assertions), in which case it shall represent them as empty objects.

<a id="_json_ld_serialised_assertions"></a>
#### 3.6.2. JSON-LD serialised assertions

For any Assertion which is serialised in the C2PA Manifest as JSON-LD, that exact same JSON-LD shall be used as the value for the assertion. For example, the `c2pa.metadata` assertion is expressed in XMP, that XMP data is serialised as JSON-LD.

An example `c2pa.metadata` assertion is shown in [A JSON-LD serialised assertion](#json-ld-assertion).

A JSON-LD serialised assertion

```json
"c2pa.metadata": {
  "@context" : {
    "Iptc4xmpExt": "http://iptc.org/std/Iptc4xmpExt/2008-02-29/",
    "photoshop" : "http://ns.adobe.com/photoshop/1.0/"
  },
  "photoshop:DateCreated": "Aug 31, 2022",
  "Iptc4xmpExt:LocationCreated": {
    "Iptc4xmpExt:City": "Beijing, China"
  }
}
```

> **NOTE:**
> The various terms and context namespaces in [A JSON-LD serialised assertion](#json-ld-assertion) are defined as part of [\[IPTC\]](#IPTC).

<a id="cbor_serialised_assertions"></a>
#### 3.6.3. CBOR serialised assertions

For each Assertion that is serialised in the C2PA Manifest as CBOR, the JSON-LD representation shall be described as the same key name in the CBOR map and its value type shall be determined by [Table 1, “Mapping from CBOR to JSON-LD”](#table_cbor_json_mapping):

**Table 1. Mapping from CBOR to JSON-LD**

| CBOR Type(s) | JSON-LD Type |
| --- | --- |
| integer, unsigned integer | unsigned number |
| negative integer | integer |
| byte string (`bstr`) | string (Base64 encoded, [\[RFC4648\]](#RFC4648), prefixed by `b64'`) |
| text string (`tstr`) | string |
| array | array |
| map | object |
| False, True | boolean |
| Null | null |
| half-precision float, single-precision float, double-precision float | float |
| date-time (CBOR tag 0) | string (direct copy from the text item inside the CBOR tag, should already be [\[ISO8601\]](#ISO8601)) |

Since CBOR allows map keys of any type, whereas JSON-LD only allows strings as keys in object values, CBOR maps with keys other than UTF-8 strings shall have those keys converted to UTF-8 strings, as defined by the implementation.

An example of a CBOR serialised assertion is shown in [CBOR Diagnostics for an actions.v2 assertion](#actions-cbordiag), and its equivalent JSON-LD representation is shown in [JSON-LD representation of CBOR Diagnostics for an actions.v2 assertion](#actions-json).

CBOR Diagnostics for an actions.v2 assertion

```none
"c2pa.actions.v2": {
  "actions": [
    {
      "action": "c2pa.cropped",
      "when": 0("2020-02-11T09:30:00Z")
    },
    {
      "action": "c2pa.filtered",
      "when": 0("2020-02-11T09:00:00Z")
    }
  ]
}
```

JSON-LD representation of [CBOR Diagnostics for an actions.v2 assertion](#actions-cbordiag)

```json
"c2pa.actions.v2": {
  "actions": [
    {
      "action": "c2pa.cropped",
      "when": "2020-02-11T09:30:00Z"
    },
    {
      "action": "c2pa.filtered",
      "when": "2020-02-11T09:00:00Z"
    }
  ]
}
```

<a id="_byte_string_encoding"></a>
##### 3.6.3.1. Byte string encoding

crJSON normalizes CBOR byte-strings (`bstr`) into Base64 ([\[RFC4648\]](#RFC4648)) string encodings, starting with the `b64'` prefix. For example, the following fields would be serialized as such:

*   `hash`
    
*   `pad`
    
*   `pad2`
    

<a id="_custom_assertions"></a>
#### 3.6.4. Custom Assertions

If a crJSON generator chooses to decode a custom assertion that is serialized in either JSON-LD or CBOR, it shall be decoded according to the rules for standard assertions. However, if it has any other serialization, then the output into crJSON is implementation dependent.

> **NOTE:**
> "Implementation dependent" could include producing an empty object for the assertion value.

<a id="_signature"></a>
### 3.7. Signature

The signature object consists of two mandatory fields - `algorithm` (which is the signature algorithm) and `certificateInfo`. In addition, it may also contain a `timestampInfo` field if the signing certificate contains a timestamp. When signature information is unavailable, `signature` shall be present as an empty object `{}`.

The value of the `algorithm` field shall be one of the strings defined in [clause=13.2.1](#C2PA), such as "ES256" or "Ed25519", or "Unknown" if it is not one of the defined values.

The `certificateInfo` field contains information about the signing certificate, such as the issuer, subject, validity period, and serial number. The JSON-LD representation of the X.509 leaf certificate (as defined in [\[RFC5280\]](#RFC5280)) from the claim signature is based on a logical mapping of its ASN.1 serialisation as defined in RFC 5280 into a JSON-LD serialized object whose key is `certificateInfo`. An example certificate is in [An example signature field with X.509 certificate information, with no time-stamp](#json-ld-x509). Additional mappings, such as the mapping of the distinguished name to JSON-LD should also be done in the most logical fashion possible.

The signature information shall include (if available):

*   `serialNumber` (from X.509 certificate)
    
*   `issuer` (from X.509 certificate, a DN map, e.g., `C`, `ST`, `L`, `O`, `OU`, `CN`)
    
*   `subject` (from X.509 certificate, a DN map)
    
*   `validity.notBefore`
    
*   `validity.notAfter`
    

> **NOTE:**
> An X.509 certificate can contain all sorts of information, and implementations may choose to include additional information in their JSON-LD representation.

The `timestampInfo` field contains information about the timestamp applied to the signature, such as the time it was created. If present, it shall contain the following fields:

*   `timestamp` (ISO 8601 formatted)
    
*   `certificateInfo` (from the time-stamp authority’s leaf X.509 certificate, same structure as the `certificateInfo` field described above)
    

An example signature field with X.509 certificate information, with no time-stamp

```json
"signature": {
  "algorithm": "ES256",
  "certificateInfo": {
    "serialNumber": "1234567890",
    "subject": {
      "ST": "CA",
      "CN": "C2PA Signer",
      "C": "US",
      "L": "Somewhere",
      "OU": "FOR TESTING_ONLY",
      "O": "C2PA Test Signing Cert"
    },
    "issuer": {
      "ST": "CA",
      "CN": "Intermediate CA",
      "C": "US",
      "L": "Somewhere",
      "OU": "FOR TESTING_ONLY",
      "O": "C2PA Test Intermediate Root CA"
    },
    "validity": {
      "notAfter": "2030-08-26T18:46:40Z",
      "notBefore": "2022-06-10T18:46:40Z"
    }
  }
}
```

Dates/times (e.g., `timestamp`, `notBefore`, `notAfter`) shall be represented as ISO 8601 strings.

Additional certificates following the first certificate provided in `x5chain` (representing intermediate certification authorities) should not be extracted into the crJSON `certificateInfo`. An implementation may choose to include them, but their serialisation is implementation dependent.

<a id="_manifest_validation_results"></a>
### 3.8. Manifest Validation Results

Each `manifest` object shall contain a `validationResults` field whose value is a `statusCodes` object along with a `validationTime` field. The `statusCodes` object groups validation status entries into `success`, `informational`, and `failure` arrays. These grouped results are the per-manifest assessments produced by the validator.

If ingredient-specific deltas are available for a manifest, they shall be represented in the sibling `ingredientDeltas` array on that same manifest object.

Each validation status entry is an object with a `code` (required), and optionally `url` and `explanation` fields.

An example of a per-manifest `validationResults` object is shown in [\[results-example\]](#results-example).

```json
"validationResults": {
  "success": [
    {
      "code": "claimSignature.insideValidity",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.signature",
      "explanation": "claim signature valid"
    },
    {
      "code": "claimSignature.validated",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.signature",
      "explanation": "claim signature valid"
    },
    {
      "code": "assertion.hashedURI.match",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.assertions/c2pa.actions.v2",
      "explanation": "hashed uri matched: self#jumbf=c2pa.assertions/c2pa.actions.v2"
    },
    {
      "code": "assertion.hashedURI.match",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.assertions/c2pa.hash.data",
      "explanation": "hashed uri matched: self#jumbf=c2pa.assertions/c2pa.hash.data"
    },
    {
      "code": "assertion.dataHash.match",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.assertions/c2pa.hash.data",
      "explanation": "data hash valid"
    }
  ],
  "informational": [],
  "failure": [
    {
      "code": "signingCredential.untrusted",
      "url": "self#jumbf=/c2pa/urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268/c2pa.signature",
      "explanation": "signing certificate untrusted"
    },
    {
      "code": "assertion.action.malformed",
      "url": "urn:c2pa:4646c5e4-31e1-4d08-8156-d90a8e323268",
      "explanation": "first action must be created or opened"
    }
  ],
  "validationTime": "2026-03-10T12:34:56Z"
}
```

The `validationTime` field is the date and time when validation was performed, represented as an RFC 3339 date-time string.

<a id="_minimal_example"></a>
## 4\. Minimal Example

The following example conforms to the crJSON schema. In many of the example values, a `…​` placeholder is used for a value that is not relevant to the example. Also, any values which would be Base64-encoded are represented as `b64'<base64>`.

```json
{
  "@context": {
    "@vocab": "https://c2pa.org/crjson",
    "extras": "https://c2pa.org/crjson/extras"
  },
  "jsonGenerator": {
    "name": "Example Tool",
    "version": "1.0.0",
  },
  "manifests": [
    {
      "label": "urn:uuid:...",
      "claim.v2": {
        "instanceID": "xmp:iid:...",
        "claim_generator_info": {"name": "Example Tool", "version": "1.0"},
        "signature": "self#jumbf=/c2pa/urn:uuid:.../c2pa.signature",
        "created_assertions": [
          {"url": "self#jumbf=c2pa.assertions/c2pa.hash.data", "hash": "b64'<base64>"}
        ],
        "gathered_assertions": [],
        "redacted_assertions": []
      },
      "assertions": {
        "c2pa.actions.v2": {"actions": []},
        "c2pa.hash.data": {"alg": "sha256", "hash": "b64'<base64>"}
      },
      "signature": {},
      "validationResults": {
        "informational": [],
        "success": [
          {"code": "claimSignature.validated"}
        ],
        "failure": []
      },
      "validationTime": "2026-03-16T18:35:24.012Z"
    }
  ]
}
```

<a id="_full_schema"></a>
## 5\. Full Schema

```json
Unresolved include directive in modules/crJSON/pages/crjson-format.adoc - include::../partials/crJSON-schema.json[]
```

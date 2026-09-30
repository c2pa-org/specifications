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
  "photoshop:DateCreated": "2022-08-31",
  "Iptc4xmpExt:LocationCreated": {
    "Iptc4xmpExt:City": "Beijing, China"
  }
}
```

> **NOTE:**
> The various terms and context namespaces in [A JSON-LD serialised assertion](#json-ld-assertion) are defined as part of [the IPTC Photo Metadata Standard](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html).

<a id="cbor_serialised_assertions"></a>
#### 3.6.3. CBOR serialised assertions

For each Assertion that is serialised in the C2PA Manifest as CBOR, the JSON-LD representation shall be described as the same key name in the CBOR map and its value type shall be determined by [Table 1, “Mapping from CBOR to JSON-LD”](#table_cbor_json_mapping):

**Table 1. Mapping from CBOR to JSON-LD**

| CBOR Type(s) | JSON-LD Type |
| --- | --- |
| integer, unsigned integer | unsigned number |
| negative integer | integer |
| byte string (`bstr`) | string (Base64 encoded, [RFC4648](https://www.rfc-editor.org/rfc/rfc4648.html), prefixed by `b64'`) |
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

The value of the `algorithm` field shall be one of the strings defined in the [\[C2PA specification](../specs/C2PA_Specification.html.md#_signature_algorithms), such as "ES256" or "Ed25519", or "Unknown" if it is not one of the defined values.

The `certificateInfo` field contains information about the signing certificate, such as the issuer, subject, validity period, and serial number. The JSON-LD representation of the X.509 leaf certificate (as defined in RFC5280) from the claim signature is based on a logical mapping of its ASN.1 serialisation as defined in RFC 5280 into a JSON-LD serialized object whose key is `certificateInfo`. An example certificate is in [An example signature field with X.509 certificate information, with no time-stamp](#json-ld-x509). Additional mappings, such as the mapping of the distinguished name to JSON-LD should also be done in the most logical fashion possible.

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
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://c2pa.org/crjson/crJSON.schema.json",
    "title": "Content Credentials JSON (crJSON) Document Schema",
    "description": "JSON Schema for Content Credentials JSON (crJSON) documents. crJSON does not include asset_info, content, or metadata.",
    "type": "object",
    "required": [
        "@context",
        "manifests",
        "jsonGenerator"
    ],
    "properties": {
        "@context": {
            "description": "JSON-LD context defining namespaces and vocabularies",
            "oneOf": [
                {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "format": "uri"
                    },
                    "minItems": 1
                },
                {
                    "type": "object",
                    "properties": {
                        "@vocab": {
                            "type": "string",
                            "format": "uri"
                        }
                    },
                    "additionalProperties": {
                        "type": "string"
                    }
                }
            ]
        },
        "manifests": {
            "description": "Array of C2PA manifests embedded in the asset",
            "type": "array",
            "items": {
                "$ref": "#/definitions/manifest"
            }
        },
        "jsonGenerator": {
            "description": "Information about the tool used to generate this JSON",
            "$ref": "#/definitions/jsonGenerator"
        }
    },
    "additionalProperties": true,
    "definitions": {
        "jsonGenerator": {
            "type": "object",
            "description": "Information about the claim generator (generator-info fields); name/version align with claim.cddl generator-info-map;",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Name of the software"
                },
                "version": {
                    "type": "string",
                    "description": "Version of the software (SemVer 2.0: major.minor.patch with optional pre-release and build)",
                    "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"
                }
            },
            "required": [
                "name",
                "version"
            ],
            "additionalProperties": true
        },
        "manifest": {
            "type": "object",
            "description": "CrJSON manifest wrapper containing label, assertions, claim or claim.v2, signature, and validationResults. Claim content: claim.cddl claim-map or claim-map-v2.",
            "required": [
                "label",
                "assertions",
                "signature",
                "validationResults"
            ],
            "oneOf": [
                {
                    "required": [
                        "claim"
                    ]
                },
                {
                    "required": [
                        "claim.v2"
                    ]
                }
            ],
            "properties": {
                "label": {
                    "type": "string",
                    "description": "Manifest label or URN identifier"
                },
                "assertions": {
                    "type": "object",
                    "description": "Assertions contained within the manifest, keyed by the assertion's label",
                    "additionalProperties": true
                },
                "claim": {
                    "$ref": "#/definitions/claimV1",
                    "description": "Claim map (v1) per C2PA CDDL claim-map; alternative to claim.v2. A manifest SHALL contain either claim or claim.v2."
                },
                "claim.v2": {
                    "$ref": "#/definitions/claim",
                    "description": "Normalized claim (v2) per C2PA CDDL claim-map-v2; alternative to claim. A manifest SHALL contain either claim or claim.v2."
                },
                "signature": {
                    "$ref": "#/definitions/signature"
                },
                "validationResults": {
                    "$ref": "#/definitions/manifestValidationResults",
                    "description": "Validation status codes for this manifest (success, informational, failure) and when validation was performed"
                },
                "ingredientDeltas": {
                    "type": "array",
                    "description": "Validation deltas for this manifest's ingredient assertions. Present when ingredients are C2PA assets.",
                    "items": {
                        "$ref": "#/definitions/ingredientDeltaValidationResult"
                    }
                }
            },
            "additionalProperties": false
        },
        "claimV1": {
            "type": "object",
            "description": "Claim map (v1). CDDL: claim.cddl claim-map. Alternative to claim.v2; each manifest may contain either claim or claim.v2.",
            "required": [
                "claim_generator",
                "claim_generator_info",
                "signature",
                "assertions",
                "dc:format",
                "instanceID"
            ],
            "properties": {
                "claim_generator": {
                    "type": "string",
                    "description": "User-Agent string for the claim generator that created the claim (RFC 7231 §5.5.3)"
                },
                "claim_generator_info": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/softwareAgent"
                    },
                    "description": "Detailed information about the claim generator (one or more generator-info maps)"
                },
                "signature": {
                    "type": "string",
                    "description": "JUMBF URI reference to the signature of this claim"
                },
                "assertions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/hashedUriMap"
                    },
                    "description": "Hashed URI references to assertions in this claim"
                },
                "dc:format": {
                    "type": "string",
                    "description": "Media type of the asset"
                },
                "instanceID": {
                    "type": "string",
                    "description": "Uniquely identifies a specific version of an asset"
                },
                "dc:title": {
                    "type": "string",
                    "description": "Name of the asset (Dublin Core)"
                },
                "redacted_assertions": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "JUMBF URI references to redacted ingredient manifest assertions"
                },
                "alg": {
                    "type": "string",
                    "description": "Cryptographic hash algorithm for data hash assertions in this claim (C2PA data hash algorithm identifier registry)"
                },
                "alg_soft": {
                    "type": "string",
                    "description": "Algorithm for soft binding assertions in this claim (C2PA soft binding algorithm identifier registry)"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                }
            },
            "additionalProperties": false
        },
        "hashedUriMap": {
            "type": "object",
            "description": "Hashed URI reference (url and hash). CDDL: hashed-uri.cddl $hashed-uri-map.",
            "required": [
                "url",
                "hash"
            ],
            "properties": {
                "url": {
                    "type": "string",
                    "description": "JUMBF URI reference"
                },
                "hash": {
                    "type": "string",
                    "description": "Hash value (Base64-encoded with b64' prefix)"
                },
                "alg": {
                    "type": "string",
                    "description": "Hash algorithm identifier; if absent, taken from enclosing structure"
                }
            },
            "additionalProperties": false
        },
        "assertionMetadataMap": {
            "type": "object",
            "description": "Additional information about an assertion. CDDL: assertion-metadata-common.cddl $assertion-metadata-map.",
            "properties": {
                "dateTime": {
                    "type": "string",
                    "format": "date-time",
                    "description": "RFC 3339 date-time when the assertion was created/generated (tdate)"
                },
                "reviewRatings": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/ratingMap"
                    },
                    "description": "Ratings given to the assertion"
                },
                "reference": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to another assertion that this review is about"
                },
                "dataSource": {
                    "$ref": "#/definitions/sourceMap",
                    "description": "Description of the source of the assertion data"
                },
                "localizations": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/localizationDataEntry"
                    },
                    "description": "Localizations for strings in the assertion"
                },
                "regionOfInterest": {
                    "$ref": "#/definitions/regionMap",
                    "description": "Region of the asset where this assertion is relevant ($region-map)"
                }
            },
            "additionalProperties": true
        },
        "sourceMap": {
            "type": "object",
            "description": "Source of assertion data. CDDL: assertion-metadata-common.cddl source-map.",
            "required": [
                "type"
            ],
            "properties": {
                "type": {
                    "type": "string",
                    "description": "Source type; $source-type",
                    "enum": [
                        "signer",
                        "claimGenerator.REE",
                        "claimGenerator.TEE",
                        "localProvider.REE",
                        "localProvider.TEE",
                        "remoteProvider.1stParty",
                        "remoteProvider.3rdParty",
                        "humanEntry",
                        "humanEntry.anonymous",
                        "humanEntry.identified"
                    ]
                },
                "details": {
                    "type": "string",
                    "description": "Human-readable details about the source, e.g. URL of the remote server"
                }
            },
            "additionalProperties": false
        },
        "ratingMap": {
            "type": "object",
            "description": "Rating of an assertion item. CDDL: assertion-metadata-common.cddl rating-map.",
            "required": [
                "value"
            ],
            "properties": {
                "value": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 5,
                    "description": "Rating from 1 (worst) to 5 (best)"
                },
                "code": {
                    "type": "string",
                    "description": "Label-formatted reason for the rating; $review-code",
                    "enum": [
                        "actions.unknownActionsPerformed",
                        "actions.missing",
                        "actions.possiblyMissing",
                        "depthMap.sceneMismatch",
                        "ingredient.modified",
                        "ingredient.possiblyModified",
                        "thumbnail.primaryMismatch",
                        "stds.iptc.location.inaccurate",
                        "stds.schema-org.CreativeWork.misattributed",
                        "stds.schema-org.CreativeWork.missingAttribution"
                    ]
                },
                "explanation": {
                    "type": "string",
                    "description": "Human-readable explanation for the rating"
                }
            },
            "additionalProperties": false
        },
        "localizationDataEntry": {
            "type": "object",
            "description": "Localization dictionary (language keys to string). CDDL: assertion-metadata-common.cddl $localization-data-entry.",
            "additionalProperties": {
                "type": "string"
            }
        },
        "claim": {
            "type": "object",
            "description": "Claim (v2). CDDL: claim.cddl claim-map-v2.",
            "required": [
                "instanceID",
                "claim_generator_info",
                "signature",
                "created_assertions"
            ],
            "properties": {
                "instanceID": {
                    "type": "string",
                    "description": "Uniquely identifies a specific version of an asset"
                },
                "claim_generator_info": {
                    "$ref": "#/definitions/softwareAgent",
                    "description": "The claim generator of this claim (single generator-info map)"
                },
                "signature": {
                    "type": "string",
                    "description": "JUMBF URI reference to the signature of this claim"
                },
                "created_assertions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/hashedUriMap"
                    },
                    "description": "Hashed URI references to created assertions"
                },
                "gathered_assertions": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/hashedUriMap"
                    },
                    "description": "Hashed URI references to gathered assertions"
                },
                "dc:title": {
                    "type": "string",
                    "description": "Name of the asset (Dublin Core)"
                },
                "redacted_assertions": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "JUMBF URI references to the assertions of ingredient manifests being redacted"
                },
                "alg": {
                    "type": "string",
                    "description": "Cryptographic hash algorithm for data hash assertions in this claim (C2PA data hash algorithm identifier registry)"
                },
                "alg_soft": {
                    "type": "string",
                    "description": "Algorithm for soft binding assertions in this claim (C2PA soft binding algorithm identifier registry)"
                },
                "specVersion": {
                    "type": "string",
                    "description": "The version of the specification used to produce this claim (SemVer)"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap",
                    "description": "Additional information about the assertion (DEPRECATED)"
                }
            },
            "additionalProperties": false
        },
        "assertions": {
            "type": "object",
            "description": "Container of assertion objects keyed by assertion label. Each key (e.g. c2pa.hash.data, c2pa.actions) corresponds to a C2PA assertion type; see definitions and INTERNAL/cddl for data-hash, boxes-hash, actions, ingredient, etc.",
            "properties": {
                "c2pa.hash.data": {
                    "$ref": "#/definitions/hashDataAssertion"
                },
                "c2pa.hash.bmff.v2": {
                    "$ref": "#/definitions/hashBmffAssertion"
                },
                "c2pa.hash.boxes": {
                    "$ref": "#/definitions/hashBoxesAssertion"
                },
                "c2pa.hash.multi-asset": {
                    "$ref": "#/definitions/hashMultiAssetAssertion"
                },
                "c2pa.actions": {
                    "$ref": "#/definitions/actionsAssertionV1"
                },
                "c2pa.actions.v2": {
                    "$ref": "#/definitions/actionsAssertionV2"
                },
                "c2pa.ingredient": {
                    "$ref": "#/definitions/ingredientAssertionV1"
                },
                "c2pa.ingredient.v2": {
                    "$ref": "#/definitions/ingredientAssertionV2"
                },
                "c2pa.ingredient.v3": {
                    "$ref": "#/definitions/ingredientAssertionV3"
                },
                "c2pa.thumbnail.claim.jpeg": {
                    "$ref": "#/definitions/thumbnailAssertion"
                },
                "c2pa.thumbnail.ingredient.jpeg": {
                    "$ref": "#/definitions/thumbnailAssertion"
                },
                "c2pa.soft-binding": {
                    "$ref": "#/definitions/softBindingAssertion"
                }
            },
            "patternProperties": {
                "^c2pa\\.thumbnail\\.ingredient": {
                    "$ref": "#/definitions/thumbnailAssertion"
                },
                "^c2pa\\.hash\\.(data|bmff\\.v2|boxes)\\.part(__[0-9]+)?$": {
                    "description": "Part hash assertion: standard hard binding assertion with .part and optional multiple instance identifier (e.g. c2pa.hash.data.part, c2pa.hash.data.part__2). Byte offsets in the assertion are relative to the part.",
                    "oneOf": [
                        {
                            "$ref": "#/definitions/hashDataAssertion"
                        },
                        {
                            "$ref": "#/definitions/hashBmffAssertion"
                        },
                        {
                            "$ref": "#/definitions/hashBoxesAssertion"
                        }
                    ]
                }
            },
            "additionalProperties": true
        },
        "hashDataAssertion": {
            "type": "object",
            "description": "Data hash assertion (c2pa.hash.data). CDDL: data-hash.cddl data-hash-map, EXCLUSION_RANGE-map.",
            "properties": {
                "alg": {
                    "type": "string",
                    "description": "Hash algorithm"
                },
                "hash": {
                    "type": "string",
                    "description": "Base64-encoded hash value with b64' prefix"
                },
                "pad": {
                    "type": "string",
                    "description": "Padding bytes"
                },
                "pad2": {
                    "type": "string",
                    "description": "Secondary padding bytes"
                },
                "name": {
                    "type": "string",
                    "description": "Name of the hashed data"
                },
                "exclusions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "start": {
                                "type": "integer",
                                "description": "Starting byte position of exclusion"
                            },
                            "length": {
                                "type": "integer",
                                "description": "Length of exclusion in bytes"
                            }
                        },
                        "required": [
                            "start",
                            "length"
                        ]
                    }
                }
            },
            "required": [
                "hash",
                "pad"
            ],
            "additionalProperties": false
        },
        "hashBoxesAssertion": {
            "type": "object",
            "description": "Boxes hash assertion (c2pa.hash.boxes). CDDL: boxes-hash.cddl box-map.",
            "required": [
                "boxes"
            ],
            "properties": {
                "boxes": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/boxHashMap"
                    },
                    "description": "Array of box-hash-map entries"
                },
                "alg": {
                    "type": "string",
                    "description": "Cryptographic hash algorithm (C2PA hash algorithm identifier). If absent, taken from enclosing structure."
                }
            },
            "additionalProperties": false
        },
        "boxHashMap": {
            "type": "object",
            "description": "Single box hash entry. CDDL: boxes-hash.cddl box-hash-map.",
            "required": [
                "names",
                "hash"
            ],
            "properties": {
                "names": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 10,
                        "description": "Box identifier in order of appearance (e.g. APP0, IHDR); box-name"
                    },
                    "description": "Box identifiers in order of appearance"
                },
                "alg": {
                    "type": "string",
                    "description": "Hash algorithm for this box; if absent, from enclosing structure"
                },
                "hash": {
                    "type": "string",
                    "description": "Hash value (byte string; in JSON typically Base64-encoded with b64' prefix)"
                },
                "excluded": {
                    "type": "boolean",
                    "description": "If true, a validator can ignore this box (and associated hash) during validation"
                },
                "exclusions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/boxExclusionsMap"
                    },
                    "description": "Hash exclusion ranges; ranges have monotonically increasing start values and do not overlap"
                },
                "pad": {
                    "type": "string",
                    "description": "Zero-filled byte string used for filling up space (typically Base64-encoded with b64' prefix in JSON)"
                },
                "pad2": {
                    "type": "string",
                    "description": "Zero-filled byte string used for filling up space (typically Base64-encoded with b64' prefix in JSON)"
                }
            },
            "additionalProperties": false
        },
        "boxExclusionsMap": {
            "type": "object",
            "description": "Exclusion range for a box. CDDL: boxes-hash.cddl box-exclusions-map.",
            "required": [
                "start",
                "length"
            ],
            "properties": {
                "start": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Starting byte offset from the start of the box (uint)"
                },
                "length": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Number of bytes of data to exclude (uint)"
                },
                "boxIndex": {
                    "type": "integer",
                    "description": "0-based index into the names array in the box-hash-map; can be omitted if the number of boxes is one"
                }
            },
            "additionalProperties": false
        },
        "hashMultiAssetAssertion": {
            "type": "object",
            "description": "Multi-asset hash assertion (c2pa.hash.multi-asset). CDDL: multi-asset-hash.cddl multi-asset-hash-map.",
            "required": [
                "parts"
            ],
            "properties": {
                "parts": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/partHashMap"
                    },
                    "description": "Array of hashes for individual parts of the multi-part file"
                }
            },
            "additionalProperties": false
        },
        "partHashMap": {
            "type": "object",
            "description": "Part hash entry. CDDL: multi-asset-hash.cddl part-hash-map.",
            "required": [
                "location",
                "hashAssertion"
            ],
            "properties": {
                "location": {
                    "$ref": "#/definitions/locatorMap",
                    "description": "Location of the part within the file (byte range or BMFF box path)"
                },
                "hashAssertion": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI to the hash assertion for the part (e.g. c2pa.hash.data.part, c2pa.hash.data.part__2). Byte offsets in that assertion are relative to the part."
                },
                "optional": {
                    "type": "boolean",
                    "description": "If true, the part is optional and can be discarded"
                }
            },
            "additionalProperties": false
        },
        "locatorMap": {
            "type": "object",
            "description": "Location of a part (byte range or BMFF box path). CDDL: multi-asset-hash.cddl locator-map.",
            "oneOf": [
                {
                    "required": [
                        "byteOffset",
                        "length"
                    ],
                    "properties": {
                        "byteOffset": {
                            "type": "integer",
                            "minimum": 0,
                            "description": "Byte offset of the part within the file (uint)"
                        },
                        "length": {
                            "type": "integer",
                            "minimum": 0,
                            "description": "Length of the part in bytes (uint)"
                        }
                    },
                    "additionalProperties": false
                },
                {
                    "required": [
                        "bmffBox"
                    ],
                    "properties": {
                        "bmffBox": {
                            "type": "string",
                            "description": "XPath to the BMFF box of the part"
                        }
                    },
                    "additionalProperties": false
                }
            ]
        },
        "softBindingAssertion": {
            "type": "object",
            "description": "Soft binding assertion (c2pa.soft-binding). CDDL: soft-binding.cddl soft-binding-map.",
            "required": [
                "alg",
                "blocks"
            ],
            "properties": {
                "alg": {
                    "type": "string",
                    "description": "Soft binding algorithm and version from C2PA soft binding algorithm list. If absent, taken from enclosing alg_soft."
                },
                "blocks": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/softBindingBlockMap"
                    },
                    "description": "One or more soft bindings across some or all of the asset's content"
                },
                "pad": {
                    "type": "string",
                    "description": "Zero-filled byte string for filling space (typically Base64 in JSON)"
                },
                "pad2": {
                    "type": "string",
                    "description": "Zero-filled byte string for filling space (typically Base64 in JSON)"
                },
                "name": {
                    "type": "string",
                    "description": "Human-readable description of what this hash covers"
                },
                "alg-params": {
                    "type": "string",
                    "description": "CBOR byte string (e.g. Base64 in JSON) describing parameters of the soft binding algorithm"
                },
                "bindingMetadata": {
                    "$ref": "#/definitions/softBindingMetadataMap",
                    "description": "Additional metadata of the soft binding"
                },
                "url": {
                    "type": "string",
                    "format": "uri",
                    "description": "Unused and deprecated"
                }
            },
            "additionalProperties": false
        },
        "softBindingBlockMap": {
            "type": "object",
            "description": "Single soft binding block. CDDL: soft-binding.cddl soft-binding-block-map.",
            "required": [
                "scope",
                "value"
            ],
            "properties": {
                "scope": {
                    "$ref": "#/definitions/softBindingScopeMap",
                    "description": "Scope of the digital content over which the soft binding is computed"
                },
                "value": {
                    "type": "string",
                    "description": "CBOR byte string (e.g. Base64 in JSON), in algorithm-specific format, for the soft binding value over this block"
                }
            },
            "additionalProperties": false
        },
        "softBindingScopeMap": {
            "type": "object",
            "description": "Scope of content for a soft binding block. CDDL: soft-binding.cddl soft-binding-scope-map.",
            "properties": {
                "extent": {
                    "type": "string",
                    "description": "Deprecated. CBOR byte string (e.g. Base64) describing the part of content over which the binding was computed"
                },
                "timespan": {
                    "$ref": "#/definitions/softBindingTimespanMap",
                    "description": "Time range over which the soft binding value has been computed"
                },
                "region": {
                    "$ref": "#/definitions/regionMap",
                    "description": "Region of interest (region-map)"
                }
            },
            "additionalProperties": false
        },
        "softBindingTimespanMap": {
            "type": "object",
            "description": "Time range for soft binding. CDDL: soft-binding.cddl soft-binding-timespan-map.",
            "required": [
                "start",
                "end"
            ],
            "properties": {
                "start": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Start of the time range in milliseconds from media start (uint)"
                },
                "end": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "End of the time range in milliseconds from media start (uint)"
                }
            },
            "additionalProperties": false
        },
        "softBindingMetadataMap": {
            "type": "object",
            "description": "Additional metadata for soft binding. CDDL: soft-binding.cddl soft-binding-metadata-map.",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "Additional description of the implementation or author of the binding or algorithm"
                },
                "contact": {
                    "type": "string",
                    "description": "Contact information for the implementation or author of the binding or algorithm"
                },
                "informationalUrl": {
                    "type": "string",
                    "description": "Web page with more details about the implementation or author of the binding or algorithm"
                }
            },
            "additionalProperties": true
        },
        "actionsAssertionV1": {
            "type": "object",
            "description": "Actions assertion (v1) (c2pa.actions). CDDL: actions.cddl actions-map.",
            "properties": {
                "actions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/actionItemV1"
                    },
                    "description": "List of actions (action-items-map)"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                }
            },
            "required": [
                "actions"
            ],
            "additionalProperties": false
        },
        "actionItemV1": {
            "type": "object",
            "description": "Single action (v1). CDDL: actions.cddl action-items-map.",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action type (e.g., c2pa.created, c2pa.edited, c2pa.converted); $action-choice"
                },
                "when": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Timestamp when the action occurred (tdate)"
                },
                "softwareAgent": {
                    "type": "string",
                    "description": "The software agent that performed the action"
                },
                "changed": {
                    "type": "string",
                    "description": "Semicolon-delimited list of parts of the resource that were changed since the previous event history"
                },
                "instanceID": {
                    "type": "string",
                    "description": "xmpMM:InstanceID for the modified (output) resource (buuid)"
                },
                "parameters": {
                    "$ref": "#/definitions/parametersMapV1",
                    "description": "Additional parameters of the action"
                },
                "digitalSourceType": {
                    "type": "string",
                    "description": "One of the defined source types at https://cv.iptc.org/newscodes/digitalsourcetype/"
                }
            },
            "required": [
                "action"
            ],
            "additionalProperties": false
        },
        "parametersMapV1": {
            "type": "object",
            "description": "Action parameters (v1). CDDL: actions.cddl parameters-map.",
            "properties": {
                "ingredient": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI to the ingredient assertion this action acts on"
                },
                "description": {
                    "type": "string",
                    "description": "Additional description of the action"
                }
            },
            "additionalProperties": true
        },
        "actionsAssertionV2": {
            "type": "object",
            "description": "Actions assertion (v2) (c2pa.actions.v2). CDDL: actions.cddl actions-map-v2.",
            "properties": {
                "actions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/actionItemV2"
                    },
                    "description": "List of actions (action-item-map-v2)"
                },
                "templates": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/actionTemplateV2"
                    },
                    "description": "List of templates for the actions"
                },
                "softwareAgents": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/softwareAgent"
                    },
                    "description": "List of software/hardware that performed the actions (generator-info maps)"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                },
                "allActionsIncluded": {
                    "type": "boolean",
                    "description": "If true, indicates that all actions performed are included in this assertion"
                }
            },
            "required": [
                "actions"
            ],
            "additionalProperties": false
        },
        "actionItemV2": {
            "type": "object",
            "description": "Single action (v2). CDDL: actions.cddl action-item-map-v2.",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action type; $action-choice"
                },
                "softwareAgent": {
                    "$ref": "#/definitions/softwareAgent",
                    "description": "Description of the software/hardware that did the action (generator-info map)"
                },
                "softwareAgentIndex": {
                    "type": "integer",
                    "description": "0-based index into the softwareAgents array in the actions assertion"
                },
                "description": {
                    "type": "string",
                    "description": "Additional description of the action, important for custom actions"
                },
                "digitalSourceType": {
                    "type": "string",
                    "description": "One of the defined source types at https://cv.iptc.org/newscodes/digitalsourcetype/"
                },
                "when": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Timestamp when the action occurred (tdate)"
                },
                "changes": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/regionMap"
                    },
                    "description": "Regions of interest of the resource that were changed"
                },
                "related": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/actionItemV2"
                    },
                    "description": "List of related actions"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason the action was performed (required when action is c2pa.redacted); $action-reason"
                },
                "parameters": {
                    "$ref": "#/definitions/parametersMapV2",
                    "description": "Additional parameters of the action"
                }
            },
            "required": [
                "action"
            ],
            "additionalProperties": false
        },
        "actionTemplateV2": {
            "type": "object",
            "description": "Action template (v2). CDDL: actions.cddl action-template-map-v2.",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action type or \"*\" for templates; $action-choice / \"*\""
                },
                "softwareAgent": {
                    "$ref": "#/definitions/softwareAgent",
                    "description": "Description of the software/hardware (generator-info map)"
                },
                "softwareAgentIndex": {
                    "type": "integer",
                    "description": "0-based index into the softwareAgents array"
                },
                "description": {
                    "type": "string",
                    "description": "Additional description of the action"
                },
                "digitalSourceType": {
                    "type": "string",
                    "description": "Digital source type URI"
                },
                "icon": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to an embedded data assertion"
                },
                "templateParameters": {
                    "type": "object",
                    "description": "Additional parameters of the template (parameters-common-map-v2)",
                    "additionalProperties": true
                }
            },
            "required": [
                "action"
            ],
            "additionalProperties": false
        },
        "regionMap": {
            "type": "object",
            "description": "Region of interest. CDDL: regions-of-interest.cddl region-map.",
            "additionalProperties": true
        },
        "parametersMapV2": {
            "type": "object",
            "description": "Action parameters (v2). CDDL: actions.cddl parameters-map-v2.",
            "properties": {
                "redacted": {
                    "type": "string",
                    "description": "JUMBF URI to the redacted assertion (required when action is c2pa.redacted)"
                },
                "ingredients": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/hashedUriMap"
                    },
                    "description": "List of hashed JUMBF URIs to ingredient (v2 or v3) assertion(s) this action acts on"
                },
                "sourceLanguage": {
                    "type": "string",
                    "description": "BCP-47 code of the source language for c2pa.translated"
                },
                "targetLanguage": {
                    "type": "string",
                    "description": "BCP-47 code of the target language for c2pa.translated"
                },
                "multipleInstances": {
                    "type": "boolean",
                    "description": "Whether this action was performed multiple times"
                }
            },
            "additionalProperties": true
        },
        "softwareAgent": {
            "type": "object",
            "description": "Generator/software agent info. CDDL: claim.cddl generator-info-map.",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Name of the software"
                },
                "version": {
                    "type": "string",
                    "description": "Version of the software"
                },
                "icon": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Icon representing the software/hardware"
                },
                "operating_system": {
                    "type": "string",
                    "description": "Operating system the software runs on"
                }
            },
            "required": [
                "name"
            ],
            "additionalProperties": true
        },
        "certificateInfo": {
            "type": "object",
            "description": "Certificate details (serial number, issuer, subject, validity). CrJSON decoding of signing certificate; no CDDL rule in INTERNAL/cddl.",
            "properties": {
                "serialNumber": {
                    "type": "string",
                    "description": "Certificate serial number"
                },
                "issuer": {
                    "$ref": "#/definitions/distinguishedName"
                },
                "subject": {
                    "$ref": "#/definitions/distinguishedName"
                },
                "validity": {
                    "type": "object",
                    "properties": {
                        "notBefore": {
                            "type": "string",
                            "format": "date-time"
                        },
                        "notAfter": {
                            "type": "string",
                            "format": "date-time"
                        }
                    }
                }
            },
            "required": [
                "serialNumber",
                "issuer",
                "subject",
                "validity"
            ],
            "additionalProperties": true
        },
        "signature": {
            "type": "object",
            "description": "Decoded claim signature (algorithm, certificate, optional timestamp). CrJSON decoding of Claim Signature box; no CDDL rule in INTERNAL/cddl.",
            "properties": {
                "algorithm": {
                    "type": "string",
                    "description": "Algorithm used for signing (e.g., SHA256withECDSA)"
                },
                "certificateInfo": {
                    "$ref": "#/definitions/certificateInfo"
                },
                "timeStampInfo": {
                    "type": "object",
                    "description": "Timestamp information (e.g. from TSA), when present",
                    "properties": {
                        "timestamp": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Time at which the time-stamp was created; RFC 3339 format"
                        },
                        "certificateInfo": {
                            "$ref": "#/definitions/certificateInfo"
                        }
                    },
                    "required": [
                        "timestamp",
                        "certificateInfo"
                    ]
                }
            },
            "required": [
                "algorithm",
                "certificateInfo"
            ],
            "additionalProperties": false
        },
        "distinguishedName": {
            "type": "object",
            "description": "X.509 Distinguished Name components. Used in signature/certificate decoding; no CDDL rule in INTERNAL/cddl.",
            "properties": {
                "C": {
                    "type": "string",
                    "description": "Country"
                },
                "ST": {
                    "type": "string",
                    "description": "State or province"
                },
                "L": {
                    "type": "string",
                    "description": "Locality"
                },
                "O": {
                    "type": "string",
                    "description": "Organization"
                },
                "OU": {
                    "type": "string",
                    "description": "Organizational unit"
                },
                "CN": {
                    "type": "string",
                    "description": "Common name"
                },
                "E": {
                    "type": "string",
                    "description": "Email address"
                },
                "2.5.4.97": {
                    "type": "string",
                    "description": "Organization identifier OID"
                }
            },
            "additionalProperties": false
        },
        "manifestValidationResults": {
            "type": "object",
            "description": "Per-manifest validation status codes and validation time. Used in each manifest's validationResults.",
            "properties": {
                "success": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                },
                "informational": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                },
                "failure": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                },
                "specVersion": {
                    "type": "string",
                    "description": "The version of the specification against which the validation was performed (SemVer formatted string)",
                    "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"
                },
                "validationTime": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Time when the validation was performed; RFC 3339 format"
                }
            },
            "required": [
                "success",
                "informational",
                "failure",
                "specVersion",
                "validationTime"
            ],
            "additionalProperties": false
        },
        "ingredientAssertionV1": {
            "type": "object",
            "description": "Ingredient assertion (v1) (c2pa.ingredient). CDDL: ingredient.cddl ingredient-map.",
            "required": [
                "dc:title",
                "dc:format",
                "instanceID",
                "relationship"
            ],
            "properties": {
                "dc:title": {
                    "type": "string",
                    "description": "Name of the ingredient (Dublin Core)"
                },
                "dc:format": {
                    "type": "string",
                    "description": "Media type of the ingredient (format-string)"
                },
                "documentID": {
                    "type": "string",
                    "description": "Value of the ingredient's xmpMM:DocumentID"
                },
                "instanceID": {
                    "type": "string",
                    "description": "Unique identifier, e.g. value of the ingredient's xmpMM:InstanceID"
                },
                "relationship": {
                    "type": "string",
                    "description": "Relationship of this ingredient to the asset; $relation-choice (parentOf, componentOf, inputTo)"
                },
                "c2pa_manifest": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to the C2PA Manifest of the ingredient"
                },
                "thumbnail": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to an ingredient thumbnail"
                },
                "validationStatus": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "description": "Status map per C2PA CDDL $status-map",
                        "additionalProperties": true
                    },
                    "description": "Validation status of the ingredient"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                }
            },
            "additionalProperties": false
        },
        "ingredientAssertionV2": {
            "type": "object",
            "description": "Ingredient assertion (v2) (c2pa.ingredient.v2). CDDL: ingredient.cddl ingredient-map-v2.",
            "required": [
                "dc:title",
                "dc:format",
                "relationship"
            ],
            "properties": {
                "dc:title": {
                    "type": "string",
                    "description": "Name of the ingredient (Dublin Core)"
                },
                "dc:format": {
                    "type": "string",
                    "description": "Media type of the ingredient (format-string)"
                },
                "relationship": {
                    "type": "string",
                    "description": "Relationship of this ingredient to the asset; $relation-choice"
                },
                "documentID": {
                    "type": "string",
                    "description": "Value of the ingredient's xmpMM:DocumentID"
                },
                "instanceID": {
                    "type": "string",
                    "description": "Unique identifier, e.g. value of the ingredient's xmpMM:InstanceID"
                },
                "data": {
                    "description": "Hashed URI to embedded data assertion or hashed_ext_uri to external data",
                    "oneOf": [
                        {
                            "$ref": "#/definitions/hashedUriMap"
                        },
                        {
                            "$ref": "#/definitions/hashedExtUriMap"
                        }
                    ]
                },
                "data_types": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "description": "Asset type per C2PA CDDL $asset-type-map",
                        "additionalProperties": true
                    },
                    "description": "Additional information about the data's type"
                },
                "c2pa_manifest": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to the C2PA Manifest of the ingredient"
                },
                "thumbnail": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to a thumbnail in an embedded data assertion"
                },
                "validationStatus": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "description": "Status map per C2PA CDDL $status-map",
                        "additionalProperties": true
                    },
                    "description": "Validation status of the ingredient"
                },
                "description": {
                    "type": "string",
                    "description": "Additional description of the ingredient"
                },
                "informational_URI": {
                    "type": "string",
                    "description": "URI to an informational page about the ingredient or its data"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                }
            },
            "additionalProperties": false
        },
        "ingredientAssertionV3": {
            "type": "object",
            "description": "Ingredient assertion (v3) (c2pa.ingredient.v3). CDDL: ingredient.cddl ingredient-map-v3. When the ingredient is a C2PA asset, activeManifest and validationResults are both required (validation is performed to determine the active manifest).",
            "required": [
                "relationship"
            ],
            "dependentRequired": {
                "activeManifest": ["validationResults"],
                "validationResults": ["activeManifest"]
            },
            "properties": {
                "dc:title": {
                    "type": "string",
                    "description": "Name of the ingredient (Dublin Core)"
                },
                "dc:format": {
                    "type": "string",
                    "description": "Media type of the ingredient (format-string)"
                },
                "relationship": {
                    "type": "string",
                    "description": "Relationship of this ingredient to the asset; $relation-choice"
                },
                "validationResults": {
                    "$ref": "#/definitions/validationResults",
                    "description": "Results from the claim generator performing full validation on the ingredient asset ($validation-results-map)"
                },
                "instanceID": {
                    "type": "string",
                    "description": "Unique identifier, e.g. value of the ingredient's xmpMM:InstanceID"
                },
                "data": {
                    "description": "Hashed URI to embedded data assertion or hashed_ext_uri to external data",
                    "oneOf": [
                        {
                            "$ref": "#/definitions/hashedUriMap"
                        },
                        {
                            "$ref": "#/definitions/hashedExtUriMap"
                        }
                    ]
                },
                "dataTypes": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "description": "Asset type per C2PA CDDL $asset-type-map",
                        "additionalProperties": true
                    },
                    "description": "Additional information about the data's type (v3 camelCase)"
                },
                "activeManifest": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI to the box corresponding to the active manifest of the ingredient"
                },
                "claimSignature": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI to the Claim Signature box in the C2PA Manifest of the ingredient"
                },
                "thumbnail": {
                    "$ref": "#/definitions/hashedUriMap",
                    "description": "Hashed URI reference to a thumbnail in an embedded data assertion"
                },
                "description": {
                    "type": "string",
                    "description": "Additional description of the ingredient"
                },
                "informationalURI": {
                    "type": "string",
                    "description": "URI to an informational page about the ingredient or its data (v3 camelCase)"
                },
                "softBindingsMatched": {
                    "type": "boolean",
                    "description": "Whether soft bindings were matched"
                },
                "softBindingAlgorithmsMatched": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "string"
                    },
                    "description": "Array of algorithm names used for discovering the active manifest"
                },
                "metadata": {
                    "$ref": "#/definitions/assertionMetadataMap"
                }
            },
            "additionalProperties": false
        },
        "hashedExtUriMap": {
            "type": "object",
            "description": "Reference to an external URL and its hash. CDDL: hashed-ext-uri.cddl $hashed-ext-uri-map. Used in ingredient v2/v3 data field.",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "HTTP/HTTPS URI reference to external data",
                    "format": "uri"
                },
                "alg": {
                    "type": "string",
                    "description": "String identifying the cryptographic hash algorithm used to compute the hash on this URI's data, taken from the C2PA hash algorithm identifier list."
                },
                "hash": {
                    "type": "string",
                    "description": "Base64-encoded with b64' prefix hash value of the external data"
                },
                "dc:format": {
                    "type": "string",
                    "description": "IANA media type of the data (optional)"
                },
                "size": {
                    "type": "integer",
                    "description": "Number of bytes of data (optional)"
                },
                "data_types": {
                    "type": "array",
                    "description": "Additional information about the data's type (optional)",
                    "items": {
                        "type": "object",
                        "additionalProperties": true
                    }
                }
            },
            "required": [
                "url",
                "alg",
                "hash"
            ],
            "additionalProperties": false
        },
        "thumbnailAssertion": {
            "type": "object",
            "description": "Thumbnail assertion (e.g. c2pa.thumbnail.claim.jpeg, c2pa.thumbnail.ingredient.jpeg). No CDDL in INTERNAL/cddl; structure is CrJSON/schema-defined.",
            "properties": {
                "thumbnailType": {
                    "type": "integer",
                    "description": "Thumbnail type (0=claim, 1=ingredient)"
                },
                "mimeType": {
                    "type": "string",
                    "description": "MIME type of thumbnail"
                }
            },
            "additionalProperties": false
        },
        "bmffExclusionsMap": {
            "type": "object",
            "description": "Exclusion entry for BMFF hash. CDDL: bmff-hash.cddl exclusions-map.",
            "required": [
                "xpath"
            ],
            "properties": {
                "xpath": {
                    "type": "string",
                    "description": "Location of box(es) to exclude (XPath from root node)"
                },
                "length": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Length that a leafmost box must have to be excluded"
                },
                "data": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/bmffDataMap"
                    },
                    "description": "Data at relative byte offset that must match for box to be excluded"
                },
                "subset": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/bmffSubsetMap"
                    },
                    "description": "Portion of the excluded box that is excluded from the hash"
                },
                "version": {
                    "type": "integer",
                    "description": "Version that must be set in a leafmost FullBox for the box to be excluded"
                },
                "flags": {
                    "type": "string",
                    "description": "24-bit flags (3-byte byte string, e.g. Base64-encoded with b64' prefix in JSON). Only for FullBox when version is specified."
                },
                "exact": {
                    "type": "boolean",
                    "description": "If true, flags must be an exact match (default true). Only for FullBox when flags is specified."
                }
            },
            "additionalProperties": false
        },
        "bmffDataMap": {
            "type": "object",
            "description": "CDDL: bmff-hash.cddl data-map.",
            "required": [
                "offset",
                "value"
            ],
            "properties": {
                "offset": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Relative byte offset in the leafmost box"
                },
                "value": {
                    "type": "string",
                    "description": "Byte string (e.g. Base64 in JSON) that must match at the offset"
                }
            },
            "additionalProperties": false
        },
        "bmffSubsetMap": {
            "type": "object",
            "description": "CDDL: bmff-hash.cddl subset-map.",
            "required": [
                "offset",
                "length"
            ],
            "properties": {
                "offset": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Relative byte offset within the excluded box"
                },
                "length": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Number of bytes in this subset"
                }
            },
            "additionalProperties": false
        },
        "bmffMerkleMap": {
            "type": "object",
            "description": "Merkle tree row for mdat verification. CDDL: bmff-hash.cddl merkle-map.",
            "required": [
                "uniqueId",
                "localId",
                "count",
                "hashes"
            ],
            "properties": {
                "uniqueId": {
                    "type": "integer",
                    "description": "1-based unique id to determine which Merkle tree validates a given mdat box"
                },
                "localId": {
                    "type": "integer",
                    "description": "Local id indicating Merkle tree"
                },
                "count": {
                    "type": "integer",
                    "description": "Number of leaf nodes in the Merkle tree (null nodes not included)"
                },
                "alg": {
                    "type": "string",
                    "description": "Hash algorithm for this Merkle tree; if absent, from enclosing structure"
                },
                "initHash": {
                    "type": "string",
                    "description": "Hash of init segment or bytes before first moof (fragmented MP4); absent for non-fragmented"
                },
                "hashes": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "string"
                    },
                    "description": "Ordered array representing a single row of the Merkle tree (e.g. Base64 in JSON)"
                },
                "fixedBlockSize": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "Size in bytes of a leaf node (non-fragmented MP4, piecewise mdat validation)"
                },
                "variableBlockSizes": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "description": "Size in bytes of each leaf node (non-fragmented MP4); length equals count"
                }
            },
            "additionalProperties": false
        },
        "hashBmffAssertion": {
            "type": "object",
            "description": "BMFF hash assertion (c2pa.hash.bmff.v2). CDDL: bmff-hash.cddl bmff-hash-map, exclusions-map, merkle-map.",
            "required": [
                "exclusions"
            ],
            "properties": {
                "exclusions": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/bmffExclusionsMap"
                    },
                    "description": "Box(es) to exclude from the hash"
                },
                "alg": {
                    "type": "string",
                    "description": "Hash algorithm; if absent, from enclosing structure (C2PA hash algorithm identifier list)"
                },
                "hash": {
                    "type": "string",
                    "description": "Hash of BMFF/segment excluding exclusions (e.g. Base64 in JSON)"
                },
                "merkle": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/bmffMerkleMap"
                    },
                    "description": "Merkle tree rows for verification of mdat box(es) or fragment files"
                },
                "name": {
                    "type": "string",
                    "description": "Human-readable description of what this hash covers"
                },
                "url": {
                    "type": "string",
                    "format": "uri",
                    "description": "Unused and deprecated"
                },
                "sequenceNumber": {
                    "type": "integer",
                    "minimum": 0,
                    "description": "In a live video workflow, the monotonically increasing sequence number for each segment"
                }
            },
            "additionalProperties": false
        },
        "validationResults": {
            "type": "object",
            "description": "Validation results (active manifest and optional ingredient deltas). CDDL: validation-results.cddl validation-results-map. Used in ingredient assertions (e.g. c2pa.ingredient.v3).",
            "properties": {
                "activeManifest": {
                    "$ref": "#/definitions/statusCodes",
                    "description": "Validation status codes for the active manifest. Present when ingredient is a C2PA asset."
                },
                "ingredientDeltas": {
                    "type": "array",
                    "description": "Validation deltas per ingredient assertion. Present when the ingredient is a C2PA asset.",
                    "items": {
                        "$ref": "#/definitions/ingredientDeltaValidationResult"
                    }
                },
                "specVersion": {
                    "type": "string",
                    "description": "The version of the specification against which the validation was performed (SemVer formatted string)",
                    "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"
                },
                "trustListUri": {
                    "type": "string",
                    "format": "uri",
                    "description": "URI to the trust list that was used to validate certificates"
                }
            },
            "required": [
                "activeManifest"
            ],
            "additionalProperties": false
        },
        "statusCodes": {
            "type": "object",
            "description": "Success, informational, and failure validation status codes. CDDL: validation-results.cddl status-codes-map.",
            "properties": {
                "success": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                },
                "informational": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                },
                "failure": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/validationStatusEntry"
                    }
                }
            },
            "required": [
                "success",
                "informational",
                "failure"
            ],
            "additionalProperties": false
        },
        "validationStatusEntry": {
            "type": "object",
            "description": "Single validation status (code, optional url and explanation). CDDL: validation-results.cddl status-map.",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Validation status code"
                },
                "url": {
                    "type": "string",
                    "description": "JUMBF URI where status applies"
                },
                "explanation": {
                    "type": "string",
                    "description": "Human-readable explanation"
                }
            },
            "required": [
                "code"
            ],
            "additionalProperties": false
        },
        "ingredientDeltaValidationResult": {
            "type": "object",
            "description": "Validation deltas for one ingredient's manifest. CDDL: validation-results.cddl ingredient-delta-validation-result-map.",
            "properties": {
                "ingredientAssertionURI": {
                    "type": "string",
                    "description": "JUMBF URI to the ingredient assertion"
                },
                "validationDeltas": {
                    "$ref": "#/definitions/statusCodes"
                }
            },
            "required": [
                "ingredientAssertionURI",
                "validationDeltas"
            ],
            "additionalProperties": false
        }
    }
}
```

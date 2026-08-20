# C2PA Soft Binding API

[![Creative Commons License](_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

<a id="SBR-API"></a>
## 1\. Soft Binding Resolution API for C2PA Manifest Recovery

C2PA specifies a mechanism for recovering a C2PA Manifest for an asset, for example when the metadata containing the C2PA Manifest has been stripped. This mechanism is a soft binding (for example an invisible watermark or content fingerprint). The soft binding is used to look-up the C2PA Manifest within a Manifest Repository. The soft binding is described by the soft binding assertion.

This document describes a series of [use cases](#_use_cases) for why it is necessary to recover C2PA Manifests that have become decoupled from the asset to which they belong. It then goes into detail on how to use soft bindings to solve for these use cases. This process of recovering C2PA Manifests using soft bindings is composed of 2 key components:

1.  [A soft binding algorithm list](#soft-binding-algorithm-list).
    
2.  [A soft binding resolution API](#soft-binding-resolution-api).
    

<a id="_use_cases"></a>
### 1.1. Use Cases

The following use cases illustrate common situations in which C2PA Manifest recovery is performed. In these use cases: Alice is a content producer; Bob is content consumer; Mallory is a malicious \`man in the middle' actor.

<a id="_uc1_recovery_from_stripping_of_c2pa_metadata"></a>
#### 1.1.1. UC1: Recovery from stripping of C2PA metadata

Alice is a photojournalist and captures a photo of an event, editing it to enhance visibility of some content. The camera and editing tool implement C2PA and each embed a manifest within the image. Alice knows that some distribution platforms will strip C2PA metadata and so decides to add an imperceptible watermark to the photo prior to submitting it for publication. The watermark may be added via Alice’s image editing tool, modifying the image pixels prior to signing the manifest. Or, Alice may utilize a watermark vendor’s tool to retroactively embed the watermark in the image pixels, signing the asset with a further manifest.

Bob later encounters Alice’s photo on social media but the C2PA Manifest has been stripped. Bob’s software (web browser or news client) detects that a watermark is present within the photo. Bob has configured his software to automatically interrogate well-known manifest repositories (e.g., from major news organizations, vendors of watermarking/tools) to obtain the manifest using the watermark. Bob recovers and views the manifest of the photo.

Bob is therefore aware of the provenance information for the asset, enabling him to make an informed trust decision on the asset.

<a id="_uc2_recovery_from_malicious_substitution_of_provenance_manifest_replaced_watermark_unchanged"></a>
#### 1.1.2. UC2: Recovery from malicious substitution of provenance (manifest replaced, watermark unchanged)

Alice is a photojournalist who embeds C2PA metadata within her assets to protect their integrity and gain attribution. Mallory wishes to manipulate the provenance of Alice’s photo to fake its creation story or to steal attribution. Mallory substitutes the manifest in the asset creating a new provenance chain signed by himself. Fortunately, Alice has included a watermark in her digital content.

When Bob encounters Alice’s photo online, he performs a lookup from a manifest store to obtain the manifest associated with the watermark. Bob can then compare the recovered manifest to the manifest embedded within the asset to see if the story matches up and make an appropriate trust decision e.g., potentially deciding to believe the manifest recovered from the trusted manifest store.

<a id="_uc3_recovery_from_malicious_substitution_of_provenance_manifest_stripped_watermark_substituted"></a>
#### 1.1.3. UC3: Recovery from malicious substitution of provenance (manifest stripped, watermark substituted)

Alice is a journalist who embeds C2PA metadata within her assets to protect their integrity and gain attribution. Mallory wishes to manipulate the provenance of Alice’s audio recording to fake its creation story or to steal attribution. Mallory strips the metadata from Alice’s audio recording and modifies the recording to render the watermark unreadable. She then embeds a new watermark. Mallory registers a new manifest within a watermarking vendor’s manifest store, using his new soft binding. Mallory publishes this modified audio recording on social media.

Bob encounters Mallory’s audio recording on social media and detects the presence of a watermark. Bob resolves the watermark via lookup and obtains a false attribution / back story to the audio recording. However, Bob notices that the manifest was signed by Mallory not Alice so can make an appropriate trust decision.

<a id="_uc4_watermark_lookup_in_federated_manifest_store"></a>
#### 1.1.4. UC4: Watermark lookup in federated manifest store

Alice is a photojournalist who embeds C2PA metadata within her assets to protect their integrity and gain attribution. She also embeds a watermark e.g., per UC1 and chooses any of several manifest repositories to store her manifest.

In addition to storing her manifest, she registers her watermark within a service that maps her watermark (soft binding) to the location of her manifest in one or many manifest stores.

Bob detects a watermark in Alice’s image online on social media but its manifest has been stripped by the social platform. Bob queries the service to figure out which manifest repository to resolve the watermarked soft binding against. Bob then queries the appropriate repository.

<a id="_uc5_preserving_provenance_through_non_c2pa_capable_toolchains"></a>
#### 1.1.5. UC5: Preserving provenance through non-C2PA capable toolchains

Acme Corp maintains a content production pipeline where some stages are non-C2PA capable. Bob receives an asset from freelance journalist Alice, containing a valid C2PA Manifest. Bob’s software inserts into the digital content of the assets a watermark containing a unique identifier and records the unique identifier as a soft binding assertion in the manifest. The manifest is placed within a manifest repository maintained internally by Acme Corp. The content passes through legacy content production processes that strip the C2PA Manifest. The final stages of production are C2PA compliant. The watermark is read from the asset and submitted as a query to the manifest repository run internally by Acme Corp. After passing through the non-C2PA tools, the manifest is automatically matched using the embedded watermark, and is included as an ingredient in a new manifest, which documents that actions have been performed on the content prior to entering the C2PA capable final stage of the pipeline. The manifest is embedded into the asset in the usual way. The content is published and provenance of the asset may be traced back to Alice by end consumers of the content.

<a id="_uc6_indicating_content_generated_by_ai"></a>
#### 1.1.6. UC6: Indicating Content Generated by AI

Alice is a graphic designer working on illustrating a novel. She is working on a picture of a well-known monument being destroyed by a flood. To design this image she uses a C2PA capable generative AI tool. After several prompts and manual edits she is happy with the results and renders it into a JPEG image. Because of the regulations on GenAI in force in Alice’s country, the GenAI tool adds a manifest to the image indicating the role of GenAI in creation of the image. Alice also applies a watermark to the image per UC1.

Mallory is a malicious user wanting to create fake-news from Alice’s image. He takes a screenshot of the image and publishes it on different social media platforms. Mallory’s malicious intention is to use the image of the damaged monument as clickbait in a fake-news campaign. Unfortunately, some social media platforms are not C2PA capable and strip the manifest off. However, the watermark persists through the screenshot and social media rendition processes.

Bob views Mallory’s image on social media and is running web browser software that can detect the watermark. The browser recognizes that the watermark algorithm is listed in the C2PA soft binding algorithm list and displays the Content Credentials pin on the image. Bob clicks on the pin and the browser retrieves the manifest associated with the image. It displays the manifest and flags the image as generated by AI. Bob realizes he does not have to worry as the image is fictitious and was generated by AI.

<a id="_usage_flows"></a>
### 1.2. Usage Flows

<a id="_decoupled_manifests"></a>
#### 1.2.1. Decoupled manifests

While an increasing number of tools and platforms retain and add to C2PA Manifests, a number of workflows remove C2PA Manifests, leading to decoupled provenance information from assets. Consequently, the asset may lack the correct active manifest or contain no C2PA Manifest store at all. The soft binding algorithm list and resolution API may be used to recover the active manifest.

This covers the following use cases: UC1, UC2, UC5, UC6

<a id="_watermarking_algorithms"></a>
##### 1.2.1.1. Watermarking algorithms

[\[watermark-recovery\]](#watermark-recovery) provides an example flow leveraging the soft binding algorithm list and resolution API to recover C2PA Manifests using an invisible watermark embedded in an asset.

![Diagram](https://kroki.io/plantuml/svg/eNqNVMtu2zAQvPMrFj70Fhnt0UBaKEYRGOjDsBv0UPRAUyt7UT4EcmPH_fquZLmSIjsJTxQ1Mzv7IBUTW4TJ_MMyh6_aU4mJYYUm7DEe4UC8g5-aMTod_0xUpSOToUp7bjlzS-h5AjqBabYXMGfdBuXajyFuHUqGO_IF-S3kdhuiRHZgqWWljR0Sel6rkIhDPLbAqNTJCdx8rHkzODhRTL9-wy1skUFbC4dzTnU8fY6XlA2h-o_PEv1FYHKYFPRWJ3_azYDjsRbiAAUyGu70RexblmVX-I299d3qIVoxF1EXkKQSbSFWmIJ9ZAo-ryjBw-oLlCGCCS7DJ-0qi5moX5WOM1h-X_9o9adOs9lhmm6O8-C57lSf6AMjRNruhsf1WtSRnBCaFHcII8Sge51ryJeLETZVaKgko2vE4C_6orExONR2bOhZkvefL-TYuvkkvb19qWAS9K11yK301IvvPQKV0mkTmoRHwAtNGoOkoXqvyeqN3L82o0QFvl4SSbo_e-cLtSjglSkdenrfG9J3fZUyPErYG8AnYlXXRw1v1POSn4hp2kmoKxbV2FMVg8GUZPabJweLDvwPbfBlLg==?id=watermark-recovery)

<a id="_fingerprinting_algorithms"></a>
##### 1.2.1.2. Fingerprinting algorithms

[\[fingerprint-recovery\]](#fingerprint-recovery) provides an example flow leveraging the soft binding algorithm list and resolution API to recover C2PA Manifests using an asset’s fingerprint.

![Diagram](https://kroki.io/plantuml/svg/eNptU8tOwzAQvPsrVr3TCo6VAKUVoEo8qpaeEAeTbJqVHNvyLo_y9dhtkjYpPjnrmdnZR5SQGITR_GqZwZO2VCILrDB3Xxh28E1SwT3ZLQYfyMpIeR2EcvLaSsOaG8L4Apoh31__wbTKe1TdfPRxa1cKzMgWMRtkZutCzF2DoYbFH6ZPOHHrHZO4sGuAQamDE7i4SbwpMBrMBXJXj_FH197guPSXoM0WyuAOWYac9Wy1CQauIaAugKO9xt0K2ZlPIWczTwyb1SOULgzFe3JhCg93r43kpNaSV8iTj12jeBuNXA_51glCoG0lapGCdVRLvZEKQfW6dTQE2XKh2GNOJeU6RRTaApKU0kYUxDPwtXxZ_2Ns7qykUSbCiREYnMwIBhsTfSFQCeVxU5KvM7juxjqcBPEZmNqiMXYfQ9xHYCpwj-uKihcVy0jVHOqaQlPE23unaJzzx_CY6RdBqMZ-zkFf2i1dx8XC57gGvQEe3ri7LYrnntiZp1OxDpncH9O2YK7cd1y6_S8Ya2-5wInM6g92_DbJ?id=fingerprint-recovery)

<a id="_recovering_manifests"></a>
#### 1.2.2. Recovering manifests

The primary use of soft binding algorithms is the recovery of detached C2PA Manifests. However, they can also be used for other use cases such as providing information about the potential substitutions of manifests. This is done by comparing a local active C2PA Manifest (i.e., attached to the asset) with a C2PA Manifest recovered via the soft binding algorithm list and resolution API.

This covers the following use case: UC3, UC2

<a id="_watermarking_algorithms_2"></a>
##### 1.2.2.1. Watermarking algorithms

[\[watermark-golden\]](#watermark-golden) provides an example flow leveraging the soft binding algorithm list and resolution API to retrieve a C2PA Manifest using an invisible watermark embedded in an asset and cross-check it with the local active C2PA manifest.

![Diagram](https://kroki.io/plantuml/svg/eNp9U8Fu2zAMvesriNybbD0G6AbXKIYALRYkK3YYdmBkOiYqS4bEJevfT7ZlL3aD6CTL7z2-R1FKWAzBIr_fZvCClksKArl3IdzlFek3OLNU8BOFfI3-baEa9MKaG7SSaLlhsrIADKC77RVMpoVPNFbowHX6mML3rhR4ZFuwPUJmjs5HAzUYTqxwMFPC6HpHjQsszr8noL-hvKPgzB9hZyHbbkaC6hPA3ZfR3ho8YQH6vsHleegDFV0kZ68StKuX9BfrxtDyXH-Gh15iYgBDIN_VR3O8UIn51rB_3L16M_BC5CXaf9tZwwFed89QOj8vOJHza9h-3_9ImqsaRVcUVof33Flpb8s6IfB8rERtWoU6HrYOpSJQN5qmQkOaS9bYNYJsAa2UQiMK4pqZ-PZ0xUNS_hp78DAP0WpceIPZyky8C4vdXHEJBWnXmfwAvNKgj6DYTDwhGzzE55CcBy6oA47R4kapmKYN1YPWkML8-vR7OUzAplC3wvegsLqAzzSnz3EfZ5ouFAdUDBUHnMA4jQawf2KDKJxCnB7xTKc4rLOf6h9mHVVo?id=watermark-golden)

<a id="_fingerprinting_algorithms_2"></a>
##### 1.2.2.2. Fingerprinting Algorithms

[\[fingerprint-golden\]](#fingerprint-golden) provides an example flow leveraging the soft binding algorithm list and resolution API to retrieve a C2PA Manifest using an asset’s fingerprint and cross-check it with the local C2PA active manifest.

![Diagram](https://kroki.io/plantuml/svg/eNptUsFu2zAMvesriN7bYDsG6IbU2IYAGxbE62nYQZXpmJgsGSSXLX8_KnaSxo1Ogsj3-J74nJJGhLvq_WYF33yiFkWh4ixyX3UYfsNf0g4-U9ohD0xJ79zgWSnQ4JNOwCoSWgW8QDher3vq3Co8UWqMBVZxl9k4e4gkI0Ze4g3Ss5otDllIMx-mbnZuHAP3Hwp4CYIRg0LI_QP-8_0Q8aEd3oGPO2g5j6PmmPpp-8wRHoHRNyCmcZK4Rcnxj1JOq4EEnrdfoc08J7-i4yV8-fRjolz0XkOHsng5TIwfTcjjHJ-yIjDtOnXr8tgbW_kg7RDc1ZddBMFqs3YyYKCWgi8vDlMDhcr5qA7szHRtvtc3hFU5adlTAbwSArOzioqcbNAegVpoLzEout60-_Nu55sgedNMJ9Nov4-8RwahBo99Z1N2cWajuBl9LWEy8fPXqw2caiawsYYxOOtmDG9n1kqOhHqK3vQd6pAZ5ws8wWpLGlosrhY6lmRx4b4x3UxbjBFiDj6CD8dvOyFgL5Y0ZcK9GZ4V3X-aoTFB?id=fingerprint-golden)

<a id="_combining_watermarking_and_fingerprinting"></a>
##### 1.2.2.3. Combining Watermarking and Fingerprinting

A check may performed to verify that the recovered manifest matches the query asset bearing the watermark. This mitigates the possibility of attacking the watermarking system to spoof (e.g., transfer) a watermark from one asset to another.

One way to automate this check is to store a fingerprint of the asset within the recovered manifest, and compare the fingerprint against a similarly computed fingerprint from the query asset. This is shown in [\[watermark-and-fingerprint\]](#watermark-and-fingerprint).

![Diagram](https://kroki.io/plantuml/svg/eNqFVMtu2zAQvPMrFjklQCunORpwC8VICgMtatgNeih6oKWVvShFCuTGrv--K0p2JFlwdNJjZjgzXEoxsUG4mT8sU_iuLRUYGFaYuT36IxyId_BLM_pS-7-gbQ4F2S36ypPlG1Vpz5RRpS23GnNDKF9AB8ji7QgmzZj2eF4ugsv2oQ9fu4LhkWwui0Jqts6LoRIMtaywMX1CJ0LlArHzxxboryivMDjzyuQspMvFmaCaBPDx89neFDzqHLKHSieHUy-Yx0jOjhIyVyb4T5eVweRQfoJZI9EzoENAH9fXZttRkXxTWD-uXrw58YLwWtqb7bSiAC-rb1A4P1ywJ-ensPyx_tlqTkrN2Q7DZHOcO8v1blnHCJ62O1aLWqGUl7VD3iGoK6WpUGFGBWU6FoEyKbWU0oYVyDUw8fVpxEOr_EU6mA1D1BodbzC4UiN7YXWcKyoglwGOJi-AIwVdgqRMvddk9EbORus8UI4ReI4mN0pJmjpUA5pCG-b3_Z_kNAGLXF0L34DCpAMfaHpkT7iXKZtB_5yuZb6xo35ikCUmbZ4rYXTO661xmTZx2PhuhCa9yBnB24b-XH14WzrpyNy9txlPNrx6lJHRHOemwwVXxFcdJ2PtByqlfQ_sLgTINrM4ZPnmnyUtnZpM-tv1H_Osn_Q=?id=watermark-and-fingerprint)

<a id="soft-binding-algorithm-list"></a>
### 1.3. Soft Binding Algorithm List

The [soft binding algorithm list](https://github.com/c2pa-org/softbinding-algorithm-list) is an authoritative list of C2PA supported soft binding algorithms. It lists the fingerprinting and watermarking technologies that C2PA clients may use to recover manifests. Entries in the list also contain additional information on the algorithms to facilitate interoperability.

Developers wanting their soft binding algorithms to be referenced in soft binding assertions or in soft binding resolution API transactions shall request they be added as a new entries in the [soft binding algorithm list](https://github.com/c2pa-org/softbinding-algorithm-list).

<a id="soft-binding-resolution-api"></a>
### 1.4. Soft Binding Resolution API specification

The soft binding resolution API is a Web API providing a standard way of retrieving C2PA Manifest stores from a soft binding resolution API endpoint given a soft binding value, a manifest identifier, or an asset.

The API specification and documentation is available below in the OpenAPI format as a [JSON](#soft-binding-resolution-api-json) or [YAML](#soft-binding-resolution-api-yaml) document.

```json
{
   "openapi": "3.0.3",
   "info": {
      "title": "C2PA Soft Binding Resolution API",
      "description": "This is the OpenAPI specification of the C2PA Soft Binding Resolution API. This document specifies a web service API endpoint for matching soft bindings (e.g., watermarks or fingerprints) to C2PA Manifests.",
      "version": "1.1.0",
      "license": {
         "name": "Creative Commons Attribution 4.0 International",
         "url": "https://creativecommons.org/licenses/by/4.0/"
      }
   },
   "externalDocs": {
      "description": "C2PA Specification",
      "url": "https://c2pa.org/specifications"
   },
   "servers": [
      {
         "url": "https://c2pa.example.org/v1"
      }
   ],
   "security": [
      {
         "auth": [
            "fetch:manifests"
         ]
      },
      {}
   ],
   "paths": {
      "/matches/byBinding": {
         "get": {
            "tags": [
               "query"
            ],
            "summary": "Returns C2PA Manifest identifiers corresponding to a soft binding.",
            "description": "Given one soft binding, find zero or more manifests identifiers within the manifest store matching the soft binding.",
            "operationId": "queryByBinding",
            "parameters": [
               {
                  "name": "value",
                  "in": "query",
                  "description": "A base64-encoded string describing, in algorithm specific format, the value of the soft binding to be used as the query. Note: if the value is expected to be too large to fit in a URL then the POST method may be used.",
                  "required": true,
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "alg",
                  "in": "query",
                  "description": "A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list",
                  "required": true,
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "maxResults",
                  "in": "query",
                  "description": "The maximum number of manifest identifiers to return for each query.",
                  "schema": {
                     "type": "integer",
                     "minimum": 1,
                     "default": 10
                  }
               }
            ],
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/json": {
                        "schema": {
                           "$ref": "#/components/schemas/c2pa.softBindingQueryResult"
                        }
                     }
                  }
               },
               "400": {
                  "description": "Invalid query value",
                  "content": {}
               },
               "414": {
                  "description": "Query too long, consider using POST instead",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            },
            "security": [
               {
                  "auth": [
                     "fetch:manifests"
                  ]
               }
            ]
         },
         "post": {
            "tags": [
               "query"
            ],
            "summary": "Returns C2PA Manifest identifiers corresponding to a large soft binding value.",
            "description": "Given a large soft binding value, find zero or more matching manifest identifiers. Use this method if the size of the soft binding value is expected to be large too large to fit in a URL, otherwise favor the use of GET.",
            "operationId": "queryByLargeBinding",
            "parameters": [
               {
                  "name": "maxResults",
                  "in": "query",
                  "description": "The maximum number of manifests to return for each query.",
                  "schema": {
                     "type": "integer",
                     "minimum": 1,
                     "default": 10
                  }
               }
            ],
            "requestBody": {
               "description": "Soft binding query JSON document.",
               "content": {
                  "application/json": {
                     "schema": {
                        "$ref": "#/components/schemas/c2pa.softBindingQuery"
                     }
                  }
               },
               "required": true
            },
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/json": {
                        "schema": {
                           "$ref": "#/components/schemas/c2pa.softBindingQueryResult"
                        }
                     }
                  }
               },
               "400": {
                  "description": "Invalid request body",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            },
            "security": [
               {
                  "auth": [
                     "fetch:manifests"
                  ]
               }
            ]
         }
      },
      "/matches/byContent": {
         "post": {
            "tags": [
               "query"
            ],
            "summary": "Finds C2PA Manifest identifiers using a digital asset.",
            "description": "Find zero or more C2PA Manifest identifiers within the manifest store using an uploaded file containing a digital asset.",
            "operationId": "uploadFile",
            "parameters": [
               {
                  "name": "alg",
                  "in": "query",
                  "description": "A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list",
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "maxResults",
                  "in": "query",
                  "description": "The maximum number of manifests identifiers return for the query.",
                  "schema": {
                     "type": "integer",
                     "minimum": 1,
                     "default": 10
                  }
               },
               {
                  "name": "hintAlg",
                  "in": "query",
                  "description": "An optional parameter specifying an additional soft binding algorithm name and version (as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list) to aid in resolution of the query.",
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "hintValue",
                  "in": "query",
                  "description": "An optional parameter specifying an additional soft binding algorithm value for the corresponding hintAlg to aid in resolution of the query.",
                  "schema": {
                     "type": "string"
                  }
               }
            ],
            "requestBody": {
               "description": "Asset to match to manifests.",
               "content": {
                  "image/*": {
                     "schema": {
                        "type": "string",
                        "format": "binary",
                        "description": "Asset of type image."
                     }
                  },
                  "audio/*": {
                     "schema": {
                        "type": "string",
                        "format": "binary",
                        "description": "Asset of type audio."
                     }
                  },
                  "video/*": {
                     "schema": {
                        "type": "string",
                        "format": "binary",
                        "description": "Asset of type video."
                     }
                  },
                  "application/*": {
                     "schema": {
                        "type": "string",
                        "format": "binary",
                        "description": "Asset of type application, such as `application/pdf`."
                     }
                  },
                  "model/*": {
                     "schema": {
                        "type": "string",
                        "format": "binary",
                        "description": "Asset of type model."
                     }
                  },
                  "text/*": {
                     "schema": {
                        "type": "string",
                        "format": "string",
                        "description": "Asset of type text."
                     }
                  }
               }
            },
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/json": {
                        "schema": {
                           "$ref": "#/components/schemas/c2pa.softBindingQueryResult"
                        }
                     }
                  }
               },
               "415": {
                  "description": "Invalid asset type",
                  "content": {}
               },
               "400": {
                  "description": "Invalid request body",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            },
            "security": [
               {
                  "auth": [
                     "fetch:manifests"
                  ]
               }
            ]
         }
      },
      "/matches/byReference": {
         "post": {
            "tags": [
               "query"
            ],
            "summary": "An optional endpoint that finds C2PA Manifest identifiers using a reference URL.",
            "description": "Optional endpoint to find zero or more C2PA Manifest identifiers within the manifest store by downloading an asset or parts of an asset via a reference HTTPS URL provided by the client. As this method requires downloading the asset, it is recommended to use this method only when the asset is too large to be uploaded directly (e.g., in the case of a large video asset). Downloading arbitrary content from a URL is a potential attack vector, so the service should limit the size of the asset to be downloaded and reject an asset larger than this value. The service should also check that the downloaded asset matches the type specified in the request and reject it if it does not. The service should also check that the reference URL is using HTTPS and reject it if it is not. Other security measures should be taken to limit attacks, such as but not limited to, preventing SSRF (Server-Side Request Forgery) attacks.",
            "operationId": "queryByReference",
            "parameters": [
               {
                  "name": "alg",
                  "in": "query",
                  "description": "A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list",
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "maxResults",
                  "in": "query",
                  "description": "The maximum number of manifests identifiers return for the query.",
                  "schema": {
                     "type": "integer",
                     "minimum": 1,
                     "default": 10
                  }
               },
               {
                  "name": "hintAlg",
                  "in": "query",
                  "description": "An optional parameter specifying an additional soft binding algorithm name and version (as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list) to aid in resolution of the query.",
                  "schema": {
                     "type": "string"
                  }
               },
               {
                  "name": "hintValue",
                  "in": "query",
                  "description": "An optional parameter specifying an additional soft binding algorithm value for the corresponding hintAlg to aid in resolution of the query.",
                  "schema": {
                     "type": "string"
                  }
               }
            ],
            "requestBody": {
               "description": "JSON document to provide an asset by reference.",
               "content": {
                  "application/json": {
                     "schema": {
                        "type": "object",
                        "properties": {
                           "referenceUrl": {
                              "type": "string",
                              "format": "uri",
                              "pattern": "^https://.*",
                              "description": "An HTTPS URL referencing the resource to be used for finding the C2PA Manifest identifiers. To limit attacks, this URL should be signed and should expire after a short time.",
                              "example": "https://example.com/video.mp4?ClientAccessKeyId=AKIA...&Expires=1712345678&Signature=abcdefg"
                           },
                           "assetLength": {
                              "type": "integer",
                              "description": "Size of the asset to be downloaded from the reference URL in bytes. The service shall use this value to limit the size of the asset to be downloaded and reject an asset larger than this value.",
                              "example": 20971520
                           },
                           "assetType": {
                              "type": "string",
                              "description": "The IANA Media Type of the asset to be downloaded from the reference URL, such as 'video/mp4' or 'audio/mpeg'. The service shall check that the downloaded asset matches this type and reject it if it does not.",
                              "example": "video/mp4"
                           },
                           "region": {
                              "type": "array",
                              "description": "An optional array specifying the region of interest within the asset as per the C2PA Regions of Interest specification (see https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html#_regions_of_interest). If specified, the service shall only match soft bindings within the specified region of interest. If not specified, the service shall match soft bindings within the entire asset.",
                              "items": {
                                 "$ref": "#/components/schemas/c2pa.regionOfInterest"
                              }
                           }
                        },
                        "required": [
                           "referenceUrl",
                           "assetLength"
                        ]
                     }
                  }
               },
               "required": true
            },
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/json": {
                        "schema": {
                           "$ref": "#/components/schemas/c2pa.softBindingQueryResult"
                        }
                     }
                  }
               },
               "400": {
                  "description": "Invalid request body",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            },
            "security": [
               {
                  "auth": [
                     "fetch:manifests"
                  ]
               }
            ]
         }
      },
      "/manifests/{manifestId}": {
         "get": {
            "tags": [
               "fetch"
            ],
            "summary": "Returns a full C2PA Manifest Store or an active C2PA Manifest.",
            "description": "Retrieve a C2PA Manifest by manifest identifier. This either returns the active manifest or the entire C2PA Manifest Store that the active manifest identifier is part of. C2PA Manifest identifiers should follow the format described in the C2PA Technical specification at xref:specs:C2PA_Specification.adoc[_unique_identifiers]",
            "operationId": "getManifestById",
            "parameters": [
               {
                  "name": "returnActiveManifest",
                  "in": "query",
                  "description": "Specifies if only the active manifest should be returned. By default the entire C2PA Manifest Store is returned.",
                  "schema": {
                     "type": "boolean",
                     "default": false
                  }
               },
               {
                  "name": "manifestId",
                  "in": "path",
                  "description": "Identifier of the C2PA Manifest to return",
                  "required": true,
                  "schema": {
                     "type": "string"
                  }
               }
            ],
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/c2pa": {}
                  }
               },
               "400": {
                  "description": "Invalid query value",
                  "content": {}
               },
               "404": {
                  "description": "C2PA Manifest Id not found",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            },
            "security": [
               {
                  "auth": [
                     "fetch:manifests"
                  ]
               }
            ]
         }
      },
      "/services/supportedAlgorithms": {
         "get": {
            "tags": [
               "service"
            ],
            "summary": "Returns a list of the soft binding algorithms supported by the service.",
            "description": "Enumerate the names of soft binding algorithms supported as queries by the service. See https://github.com/c2pa-org/softbinding-algorithm-list for an authoritative list of C2PA soft binding algorithm names.",
            "operationId": "getSupportedBindings",
            "responses": {
               "200": {
                  "description": "Successful operation",
                  "content": {
                     "application/json": {
                        "schema": {
                           "$ref": "#/components/schemas/c2pa.softBindingAlgList"
                        }
                     }
                  }
               },
               "400": {
                  "description": "Invalid request",
                  "content": {}
               },
               "500": {
                  "description": "Service failure",
                  "content": {}
               }
            }
         }
      }
   },
   "components": {
      "schemas": {
         "c2pa.softBindingAlgList": {
            "description": "list of the names of soft binding algorithms supported by this service. The authoritative list of name is available here: https://github.com/c2pa-org/softbinding-algorithm-list",
            "properties": {
               "watermarks": {
                  "type": "array",
                  "items": {
                     "type": "object",
                     "oneOf": [
                        {
                           "required": [
                              "watermarks"
                           ]
                        },
                        {
                           "required": [
                              "fingerprints"
                           ]
                        }
                     ],
                     "properties": {
                        "alg": {
                           "type": "string",
                           "example": "foo.bar.watermark.1",
                           "description": "Unique identifier of a fingerprint algorithm."
                        }
                     },
                     "required": [
                        "alg"
                     ]
                  }
               },
               "fingerprints": {
                  "type": "array",
                  "items": {
                     "type": "object",
                     "properties": {
                        "alg": {
                           "type": "string",
                           "example": "foo.bar.fingerprint.1",
                           "description": "Unique identifier of a watermark algorithm."
                        }
                     },
                     "required": [
                        "alg"
                     ]
                  }
               }
            }
         },
         "c2pa.softBindingQuery": {
            "required": [
               "value",
               "alg"
            ],
            "type": "object",
            "properties": {
               "alg": {
                  "type": "string",
                  "description": "A string identifying the soft binding algorithm and version of that algorithm used."
               },
               "value": {
                  "type": "string",
                  "description": "A base64-encoded string describing, in algorithm specific format, the value of the soft binding to be used as the query."
               }
            }
         },
         "c2pa.softBindingQueryResult": {
            "type": "object",
            "properties": {
               "matches": {
                  "type": "array",
                  "items": {
                     "type": "object",
                     "properties": {
                        "manifestId": {
                           "type": "string",
                           "description": "Unique identifier of a matched C2PA Manifest"
                        },
                        "endpoint": {
                           "type": "string",
                           "description": "Endpoint of a Soft Binding Resolution API from which the C2PA Manifest may be obtained. If the endpoint is absent then the C2PA Manifest is available from same endpoint the query was sent to using the /manifests endpoint."
                        },
                        "similarityScore": {
                           "type": "integer",
                           "minimum": 0,
                           "maximum": 100,
                           "description": "An integer score in the range (0-100) representing the strength of match, if appropriate, where 0 is the weakest possible match and 100 is the strongest possible match."
                        }
                     },
                     "required": [
                        "manifestId"
                     ]
                  }
               }
            }
         },
         "c2pa.regionOfInterest": {
            "oneOf": [
               {
                  "$ref": "#/components/schemas/SpatialRange"
               },
               {
                  "$ref": "#/components/schemas/TemporalRange"
               },
               {
                  "$ref": "#/components/schemas/FrameRange"
               },
               {
                  "$ref": "#/components/schemas/TextualRange"
               },
               {
                  "$ref": "#/components/schemas/IdentifiedRange"
               }
            ],
            "discriminator": {
               "propertyName": "type",
               "mapping": {
                  "spatial": "#/components/schemas/SpatialRange",
                  "temporal": "#/components/schemas/TemporalRange",
                  "frame": "#/components/schemas/FrameRange",
                  "textual": "#/components/schemas/TextualRange",
                  "identified": "#/components/schemas/IdentifiedRange"
               }
            }
         },
         "SpatialRange": {
            "type": "object",
            "properties": {
               "type": {
                  "type": "string",
                  "enum": [
                     "spatial"
                  ]
               },
               "shape": {
                  "type": "object",
                  "properties": {
                     "kind": {
                        "type": "string",
                        "enum": [
                           "rectangle",
                           "circle",
                           "polygon"
                        ],
                        "example": "rectangle"
                     },
                     "unit": {
                        "type": "string",
                        "enum": [
                           "pixel",
                           "percent"
                        ],
                        "example": "pixel"
                     },
                     "origin": {
                        "type": "object",
                        "properties": {
                           "x": {
                              "type": "number",
                              "example": 10.0
                           },
                           "y": {
                              "type": "number",
                              "example": 5.0
                           }
                        },
                        "required": [
                           "x",
                           "y"
                        ]
                     }
                  },
                  "required": [
                     "kind",
                     "unit"
                  ]
               }
            },
            "required": [
               "type",
               "shape"
            ]
         },
         "TemporalRange": {
            "type": "object",
            "properties": {
               "type": {
                  "type": "string",
                  "enum": [
                     "temporal"
                  ]
               },
               "time": {
                  "type": "object",
                  "description": "A time range described either using Normal Play Time as described in RFC 2326 or Wall Clock Time using the Internet profile of ISO 8601 as described in RFC 3339.",
                  "properties": {
                     "type": {
                        "type": "string",
                        "enum": [
                           "ntp",
                           "wall-clock"
                        ]
                     },
                     "start": {
                        "type": "string",
                        "example": "12:05:30.5"
                     },
                     "end": {
                        "type": "string",
                        "example": "12:07:40.2"
                     }
                  },
                  "required": [
                     "start",
                     "end"
                  ]
               }
            },
            "required": [
               "type",
               "time"
            ]
         },
         "FrameRange": {
            "type": "object",
            "properties": {
               "type": {
                  "type": "string",
                  "enum": [
                     "frame"
                  ]
               },
               "frame": {
                  "type": "object",
                  "properties": {
                     "start": {
                        "type": "integer",
                        "minimum": 0
                     },
                     "end": {
                        "type": "integer",
                        "minimum": 0
                     }
                  },
                  "required": [
                     "start",
                     "end"
                  ]
               }
            },
            "required": [
               "type",
               "frame"
            ]
         },
         "TextualRange": {
            "type": "object",
            "properties": {
               "type": {
                  "type": "string",
                  "enum": [
                     "textual"
                  ]
               },
               "text": {
                  "type": "object",
                  "properties": {
                     "selector": {
                        "type": "object",
                        "properties": {
                           "fragment": {
                              "type": "string",
                              "description": "Fragment identifier, as per RFC3023 or ISO 32000-2, Annex O.",
                              "example": "page=1,rect=10,10,450,500"
                           },
                           "start": {
                              "type": "integer",
                              "minimum": 0
                           },
                           "end": {
                              "type": "integer",
                              "minimum": 0
                           }
                        },
                        "required": [
                           "fragment"
                        ]
                     }
                  },
                  "required": [
                     "selector"
                  ]
               }
            },
            "required": [
               "type",
               "text"
            ]
         },
         "IdentifiedRange": {
            "type": "object",
            "properties": {
               "type": {
                  "type": "string",
                  "enum": [
                     "identified"
                  ]
               },
               "identified": {
                  "type": "object",
                  "properties": {
                     "identifier": {
                        "type": "string"
                     },
                     "value": {
                        "type": "string"
                     }
                  },
                  "required": [
                     "identifier",
                     "value"
                  ]
               }
            },
            "required": [
               "type",
               "identified"
            ]
         }
      },
      "securitySchemes": {
         "auth": {
            "type": "oauth2",
            "flows": {
               "clientCredentials": {
                  "tokenUrl": "https://auth.example.com/oauth/token",
                  "scopes": {
                     "fetch:manifests": "Search and read manifests within the manifest store."
                  }
               }
            }
         }
      }
   }
}
```

```yaml
openapi: 3.0.3
info:
  title: C2PA Soft Binding Resolution API
  description: This is the OpenAPI specification of the C2PA Soft Binding Resolution API. This document specifies a web service API endpoint for matching soft bindings (e.g., watermarks or fingerprints) to C2PA Manifests.
  version: 1.1.0
  license:
    name: Creative Commons Attribution 4.0 International
    url: https://creativecommons.org/licenses/by/4.0/
externalDocs:
  description: C2PA Specification
  url: https://c2pa.org/specifications
servers:
  - url: https://c2pa.example.org/v1
security:
  - auth:
      - fetch:manifests
  - {}
paths:
  /matches/byBinding:
    get:
      tags:
        - query
      summary: Returns C2PA Manifest identifiers corresponding to a soft binding.
      description: Given one soft binding, find zero or more manifests identifiers within the manifest store matching the soft binding.
      operationId: queryByBinding
      parameters:
        - name: value
          in: query
          description: 'A base64-encoded string describing, in algorithm specific format, the value of the soft binding to be used as the query. Note: if the value is expected to be too large to fit in a URL then the POST method may be used.'
          required: true
          schema:
            type: string
        - name: alg
          in: query
          description: 'A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list'
          required: true
          schema:
            type: string
        - name: maxResults
          in: query
          description: The maximum number of manifest identifiers to return for each query.
          schema:
            type: integer
            minimum: 1
            default: 10
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/c2pa.softBindingQueryResult'
        '400':
          description: Invalid query value
          content: {}
        '414':
          description: Query too long, consider using POST instead
          content: {}
        '500':
          description: Service failure
          content: {}
      security:
        - auth:
            - fetch:manifests
    post:
      tags:
        - query
      summary: Returns C2PA Manifest identifiers corresponding to a large soft binding value.
      description: Given a large soft binding value, find zero or more matching manifest identifiers. Use this method if the size of the soft binding value is expected to be large too large to fit in a URL, otherwise favor the use of GET.
      operationId: queryByLargeBinding
      parameters:
        - name: maxResults
          in: query
          description: The maximum number of manifests to return for each query.
          schema:
            type: integer
            minimum: 1
            default: 10
      requestBody:
        description: Soft binding query JSON document.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/c2pa.softBindingQuery'
        required: true
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/c2pa.softBindingQueryResult'
        '400':
          description: Invalid request body
          content: {}
        '500':
          description: Service failure
          content: {}
      security:
        - auth:
            - fetch:manifests
  /matches/byContent:
    post:
      tags:
        - query
      summary: Finds C2PA Manifest identifiers using a digital asset.
      description: Find zero or more C2PA Manifest identifiers within the manifest store using an uploaded file containing a digital asset.
      operationId: uploadFile
      parameters:
        - name: alg
          in: query
          description: 'A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list'
          schema:
            type: string
        - name: maxResults
          in: query
          description: The maximum number of manifests identifiers return for the query.
          schema:
            type: integer
            minimum: 1
            default: 10
        - name: hintAlg
          in: query
          description: 'An optional parameter specifying an additional soft binding algorithm name and version (as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list) to aid in resolution of the query.'
          schema:
            type: string
        - name: hintValue
          in: query
          description: An optional parameter specifying an additional soft binding algorithm value for the corresponding hintAlg to aid in resolution of the query.
          schema:
            type: string
      requestBody:
        description: Asset to match to manifests.
        content:
          image/*:
            schema:
              type: string
              format: binary
              description: Asset of type image.
          audio/*:
            schema:
              type: string
              format: binary
              description: Asset of type audio.
          video/*:
            schema:
              type: string
              format: binary
              description: Asset of type video.
          application/*:
            schema:
              type: string
              format: binary
              description: Asset of type application, such as `application/pdf`.
          model/*:
            schema:
              type: string
              format: binary
              description: Asset of type model.
          text/*:
            schema:
              type: string
              format: string
              description: Asset of type text.
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/c2pa.softBindingQueryResult'
        '400':
          description: Invalid request body
          content: {}
        '415':
          description: Invalid asset type
          content: {}
        '500':
          description: Service failure
          content: {}
      security:
        - auth:
            - fetch:manifests
  /matches/byReference:
    post:
      tags:
        - query
      summary: An optional endpoint that finds C2PA Manifest identifiers using a reference URL.
      description: Optional endpoint to find zero or more C2PA Manifest identifiers within the manifest store by downloading an asset or parts of an asset via a reference HTTPS URL provided by the client. As this method requires downloading the asset, it is recommended to use this method only when the asset is too large to be uploaded directly (e.g., in the case of a large video asset). Downloading arbitrary content from a URL is a potential attack vector, so the service should limit the size of the asset to be downloaded and reject an asset larger than this value. The service should also check that the downloaded asset matches the type specified in the request and reject it if it does not. The service should also check that the reference URL is using HTTPS and reject it if it is not. Other security measures should be taken to limit attacks, such as but not limited to, preventing SSRF (Server-Side Request Forgery) attacks.
      operationId: queryByReference
      parameters:
        - name: alg
          in: query
          description: 'A string identifying the soft binding algorithm and version of that algorithm used as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list'
          schema:
            type: string
        - name: maxResults
          in: query
          description: The maximum number of manifests identifiers return for the query.
          schema:
            type: integer
            minimum: 1
            default: 10
        - name: hintAlg
          in: query
          description: 'An optional parameter specifying an additional soft binding algorithm name and version (as per the authoritative list of C2PA soft binding algorithm names available at: https://github.com/c2pa-org/softbinding-algorithm-list) to aid in resolution of the query.'
          schema:
            type: string
        - name: hintValue
          in: query
          description: An optional parameter specifying an additional soft binding algorithm value for the corresponding hintAlg to aid in resolution of the query.
          schema:
            type: string
      requestBody:
        description: JSON document to provide an asset by reference.
        content:
          application/json:
            schema:
              type: object
              properties:
                referenceUrl:
                  type: string
                  format: uri
                  pattern: ^https://.*
                  description: An HTTPS URL referencing the resource to be used for finding the C2PA Manifest identifiers. To limit attacks, this URL should be signed and should expire after a short time.
                  example: https://example.com/video.mp4?ClientAccessKeyId=AKIA...&Expires=1712345678&Signature=abcdefg
                assetLength:
                  type: integer
                  description: Size of the asset to be downloaded from the reference URL in bytes. The service shall use this value to limit the size of the asset to be downloaded and reject an asset larger than this value.
                  example: 20971520
                assetType:
                  type: string
                  description: The IANA Media Type of the asset to be downloaded from the reference URL, such as 'video/mp4' or 'audio/mpeg'. The service shall check that the downloaded asset matches this type and reject it if it does not.
                  example: video/mp4
                region:
                  type: array
                  description: An optional array specifying the region of interest within the asset as per the C2PA Regions of Interest specification (see https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html#_regions_of_interest). If specified, the service shall only match soft bindings within the specified region of interest. If not specified, the service shall match soft bindings within the entire asset.
                  items:
                    $ref: '#/components/schemas/c2pa.regionOfInterest'
              required:
                - referenceUrl
                - assetLength
        required: true
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/c2pa.softBindingQueryResult'
        '400':
          description: Invalid request body
          content: {}
        '500':
          description: Service failure
          content: {}
      security:
        - auth:
            - fetch:manifests
  /manifests/{manifestId}:
    get:
      tags:
        - fetch
      summary: Returns a full C2PA Manifest Store or an active C2PA Manifest.
      description: Retrieve a C2PA Manifest by manifest identifier. This either returns the active manifest or the entire C2PA Manifest Store that the active manifest identifier is part of. C2PA Manifest identifiers should follow the format described in the C2PA Technical specification at xref:specs:C2PA_Specification.adoc[_unique_identifiers]
      operationId: getManifestById
      parameters:
        - name: returnActiveManifest
          in: query
          description: Specifies if only the active manifest should be returned. By default the entire C2PA Manifest Store is returned.
          schema:
            type: boolean
            default: false
        - name: manifestId
          in: path
          description: Identifier of the C2PA Manifest to return
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful operation
          content:
            application/c2pa: {}
        '400':
          description: Invalid query value
          content: {}
        '404':
          description: C2PA Manifest Id not found
          content: {}
        '500':
          description: Service failure
          content: {}
      security:
        - auth:
            - fetch:manifests
  /services/supportedAlgorithms:
    get:
      tags:
        - service
      summary: Returns a list of the soft binding algorithms supported by the service.
      description: Enumerate the names of soft binding algorithms supported as queries by the service. See https://github.com/c2pa-org/softbinding-algorithm-list for an authoritative list of C2PA soft binding algorithm names.
      operationId: getSupportedBindings
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/c2pa.softBindingAlgList'
        '400':
          description: Invalid request
          content: {}
        '500':
          description: Service failure
          content: {}
components:
  schemas:
    c2pa.softBindingAlgList:
      description: 'list of the names of soft binding algorithms supported by this service. The authoritative list of name is available here: https://github.com/c2pa-org/softbinding-algorithm-list'
      properties:
        watermarks:
          type: array
          items:
            type: object
            oneOf:
              - required:
                  - watermarks
              - required:
                  - fingerprints
            properties:
              alg:
                type: string
                example: foo.bar.watermark.1
                description: Unique identifier of a fingerprint algorithm.
            required:
              - alg
        fingerprints:
          type: array
          items:
            type: object
            properties:
              alg:
                type: string
                example: foo.bar.fingerprint.1
                description: Unique identifier of a watermark algorithm.
            required:
              - alg
    c2pa.softBindingQuery:
      required:
        - value
        - alg
      type: object
      properties:
        alg:
          type: string
          description: A string identifying the soft binding algorithm and version of that algorithm used.
        value:
          type: string
          description: A base64-encoded string describing, in algorithm specific format, the value of the soft binding to be used as the query.
    c2pa.softBindingQueryResult:
      type: object
      properties:
        matches:
          type: array
          items:
            type: object
            properties:
              manifestId:
                type: string
                description: Unique identifier of a matched C2PA Manifest
              endpoint:
                type: string
                description: Endpoint of a Soft Binding Resolution API from which the C2PA Manifest may be obtained. If the endpoint is absent then the C2PA Manifest is available from same endpoint the query was sent to using the /manifests endpoint.
              similarityScore:
                type: integer
                minimum: 0
                maximum: 100
                description: An integer score in the range (0-100) representing the strength of match, if appropriate, where 0 is the weakest possible match and 100 is the strongest possible match.
            required:
              - manifestId
    c2pa.regionOfInterest:
      oneOf:
        - $ref: '#/components/schemas/SpatialRange'
        - $ref: '#/components/schemas/TemporalRange'
        - $ref: '#/components/schemas/FrameRange'
        - $ref: '#/components/schemas/TextualRange'
        - $ref: '#/components/schemas/IdentifiedRange'
      discriminator:
        propertyName: type
        mapping:
          spatial: '#/components/schemas/SpatialRange'
          temporal: '#/components/schemas/TemporalRange'
          frame: '#/components/schemas/FrameRange'
          textual: '#/components/schemas/TextualRange'
          identified: '#/components/schemas/IdentifiedRange'
    SpatialRange:
      type: object
      properties:
        type:
          type: string
          enum:
            - spatial
        shape:
          type: object
          properties:
            kind:
              type: string
              enum:
                - rectangle
                - circle
                - polygon
              example: rectangle
            unit:
              type: string
              enum:
                - pixel
                - percent
              example: pixel
            origin:
              type: object
              properties:
                x:
                  type: number
                  example: 10
                'y':
                  type: number
                  example: 5
              required:
                - x
                - 'y'
          required:
            - kind
            - unit
      required:
        - type
        - shape
    TemporalRange:
      type: object
      properties:
        type:
          type: string
          enum:
            - temporal
        time:
          type: object
          description: A time range described either using Normal Play Time as described in RFC 2326 or Wall Clock Time using the Internet profile of ISO 8601 as described in RFC 3339.
          properties:
            type:
              type: string
              enum:
                - ntp
                - wall-clock
            start:
              type: string
              example: '12:05:30.5'
            end:
              type: string
              example: '12:07:40.2'
          required:
            - start
            - end
      required:
        - type
        - time
    FrameRange:
      type: object
      properties:
        type:
          type: string
          enum:
            - frame
        frame:
          type: object
          properties:
            start:
              type: integer
              minimum: 0
            end:
              type: integer
              minimum: 0
          required:
            - start
            - end
      required:
        - type
        - frame
    TextualRange:
      type: object
      properties:
        type:
          type: string
          enum:
            - textual
        text:
          type: object
          properties:
            selector:
              type: object
              properties:
                fragment:
                  type: string
                  description: Fragment identifier, as per RFC3023 or ISO 32000-2, Annex O.
                  example: page=1,rect=10,10,450,500
                start:
                  type: integer
                  minimum: 0
                end:
                  type: integer
                  minimum: 0
              required:
                - fragment
          required:
            - selector
      required:
        - type
        - text
    IdentifiedRange:
      type: object
      properties:
        type:
          type: string
          enum:
            - identified
        identified:
          type: object
          properties:
            identifier:
              type: string
            value:
              type: string
          required:
            - identifier
            - value
      required:
        - type
        - identified
  securitySchemes:
    auth:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/oauth/token
          scopes:
            fetch:manifests: Search and read manifests within the manifest store.
```

<a id="_federated_lookup"></a>
## 2\. Federated Lookup

A mechanism is required to orchestrate search across multiple independent C2PA Manifest Repositories, as in some cases it may not be practical to discover or query a complete set of C2PA Manifest Repositories.

The Decentralized Soft Binding Resolution process enables query across multiple C2PA Manifest Repositories.

<a id="_overview_of_the_decentralized_soft_binding_resolution_process"></a>
### 2.1. Overview of the Decentralized Soft Binding Resolution Process

Distributed Ledger Technology (DLT) is used to create a decentralized Key-Value (K-V) store. The key is the soft binding value, such as may be incorporated in an asset via a watermark. The value is a URI of an endpoint implementing the soft binding resolution API. Optionally, the value may also contain the unique identifier of the C2PA Manifest.

<a id="_querying_the_k_v_store"></a>
#### 2.1.1. Querying the K-V Store

The process to retrieve a C2PA Manifest from a C2PA Manifest Repository using these APIs is illustrated via the sequence diagram below and is as follows:

1.  The C2PA Manifest consumer first computes the soft binding from the asset, for example by detecting a watermark.
    
2.  The decentralized K-V store is queried using the soft binding to obtain the URI of a C2PA Manifest Repository endpoint implementing the soft binding resolution API.
    
3.  If the manifest identifier (ID) was not published within the K-V store, it may be obtained via the Soft Binding Resolution API `/byBinding` route.
    
4.  The active manifest (and optionally the entire C2PA Manifest Store) may be obtained via the Soft Binding Resolution API `/manifests` route.
    
5.  Validation and processing of the recovered C2PA Manifest continues in the usual way.
    

<a id="_publishing_to_the_k_v_store"></a>
#### 2.1.2. Publishing to the K-V Store

A claim generator publishing a manifest into a C2PA Manifest Repository may optionally publish a Key-Value pair, comprising the soft binding and endpoint of the C2PA Manifest Repository, in order to make content searchable via the decentralized process

<a id="_accessing_the_decentralized_key_value_store"></a>
#### 2.1.3. Accessing the Decentralized Key-Value Store

If the location of the Decentralized Key-Value Store is not known, then it may be obtained via the C2PA Soft Binding Algorithm List (SBAL). The SBAL contains an optional field `softBindingResolutionApis` that may contain the address of one or more Smart Contracts that reference the Key-Value store.

<a id="_schema_for_decentralized_key_value_store"></a>
### 2.2. Schema for Decentralized Key-Value Store

There are two main approaches taken by implementers to create a Key-Value store on a DLT. The store may be contained either a) as state within a Smart Contract, or b) written out by a Smart Contract as state within the Event Log of the DLT. Moreover, the methods of representing information with the Key-Value store may differ across implementations.

In order to capture both implementation approaches a) and b), the Smart Contract referenced by the SBAL must implement a method returning JSON data that describes the format and access detail for the Key-Value store.

The JSON description must follow the schema below:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://c2pa.org/schemas/decentralized-lookup.schema.json",
  "type": "array",
  "minItems": 1,
  "items": {
    "type": "object",
    "properties": {
      "resolutionMethod": {
        "enum": [
          "smartContract",
          "eventLog"
        ],
        "description": "Category of DLT method for resolving soft bindings."
      },
      "querySmartContract": {
        "type": "object",
        "properties": {
          "smartContractAddress": {
            "type": "string",
            "description": "Address of the smart contract to call upon."
          },
          "byBindingFunctionName": {
            "type": "string",
            "description": "Name of the smart contract function providing lookup by binding, which accepts and returns a JSON string."
          },
          "byBindingInputSchema": {
            "type": "object",
            "description": "A JSON schema describing how to format the soft binding value input to the byBindingFunctionName input string parameter.",
            "properties": {
              "$schema": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "properties": {
                "type": "object",
                "properties": {
                  "softBindingValue": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type"
                    ]
                  }
                },
                "required": [
                  "softBindingValue"
                ]
              },
              "required": {
                "type": "array",
                "contains": {
                  "const": "softBindingValue"
                }
              },
              "additionalProperties": {
                "type": "boolean"
              }
            },
            "required": [
              "properties",
              "required"
            ]
          },
          "byBindingOutputSchema": {
            "type": "object",
            "description": "A JSON schema describing how to parse the endpoint and manifest ID (optional) from an event log message.",
            "properties": {
              "$schema": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "properties": {
                "type": "object",
                "properties": {
                  "endpoints": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "array"
                      },
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "const": "string"
                          },
                          "format": {
                            "const": "uri"
                          }
                        }
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type",
                      "items"
                    ]
                  },
                  "manifestId": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type"
                    ]
                  }
                },
                "required": [
                  "endpoints"
                ]
              },
              "required": {
                "type": "array",
                "contains": {
                  "const": "endpoints"
                }
              },
              "additionalProperties": {
                "type": "boolean"
              }
            },
            "required": [
              "properties",
              "required"
            ]
          }
        },
        "required": [
          "smartContractAddress",
          "byBindingFunctionName",
          "byBindingInputSchema",
          "byBindingOutputSchema"
        ]
      },
      "queryEventLog": {
        "type": "object",
        "properties": {
          "smartContractAddress": {
            "type": "string",
            "description": "Address of the smart contract function to filter events by."
          },
          "keyTopic": {
            "type": "string",
            "description": "Topic used as key to lookup soft binding identifier."
          },
          "byBindingOutputSchema": {
            "type": "object",
            "description": "A JSON schema describing how to parse the endpoint and manifest ID (optional) from an event log message.",
            "properties": {
              "$schema": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "properties": {
                "type": "object",
                "properties": {
                  "endpoints": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "array"
                      },
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "const": "string"
                          },
                          "format": {
                            "const": "uri"
                          }
                        }
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type",
                      "items"
                    ]
                  },
                  "manifestId": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type"
                    ]
                  }
                },
                "required": [
                  "endpoints"
                ]
              },
              "required": {
                "type": "array",
                "contains": {
                  "const": "endpoints"
                }
              },
              "additionalProperties": {
                "type": "boolean"
              }
            },
            "required": [
              "properties",
              "required"
            ]
          }
        },
        "required": [
          "smartContractAddress",
          "keyTopic",
          "byBindingOutputSchema"
        ]
      }
    },
    "oneOf": [
      {
        "required": [
          "querySmartContract"
        ]
      },
      {
        "required": [
          "queryEventLog"
        ]
      }
    ]
  }
}
```

The schema describes an array containing one or more methods of decentralized resolution, which contain two fields. First, a field `resolutionMethod` that indicates whether the method stores the K-V store within a smart contract (`smartContract`) or within an event log (`eventLog`). Second, a field named either `querySmartContract` or `queryEventLog` respectively, that contains the detail on the resolution method.

<a id="_smart_contract_k_v_stores"></a>
#### 2.2.1. Smart Contract K-V Stores

In the case of `querySmartContract`, the JSON object contains four required sub-fields.

`smartContractAddress`: a hex address (`0x…​`) which specifies the address of the smart contract (which may be different to the smart contract containing the `describe` method) `byBindingFunctionName`: the name of the function on that Smart Contract that may be called to query the K-V store using a soft binding. The function must accept and return a single JSON string. `byBindingInputSchema`: the schema of the input JSON string, indicating how the soft binding is to be encoded. `byBindingOutputSchema`: the schema of the output JSON string, indicating how the endpoint (and optionally, the C2PA Manifest ID) are represented in the value returned by the query.

The byBindingInputSchema object defines how the soft binding value is structured in the input to the smart contract function. It describes an object with one required field, softBindingValue, which is expected to be a base64-encoded string representing the soft binding identifier (e.g., a watermark ID). This identifier is passed in an algorithm-specific format.

The byBindingOutputSchema object defines the structure of the response returned by the smart contract function. It includes two fields.

`endpoints`: An array of URIs representing the Soft Binding Resolution APIs that may be used to resolve the manifest ID. `manifestId`: The unique identifier of the C2PA manifest, if available. This field is not required, as it may not be present in all cases.

Example JSON for a Smart Contract K-V Store:

```json
[
  {
    "resolutionMethod": "smartContract",
    "querySmartContract": {
      "smartContractAddress": "0xABC123DEF4567890ABCDEF1234567890ABCDEF12",
      "byBindingFunctionName": "getManifestByBinding",
      "byBindingInputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "softBindingValue": {
            "type": "string",
            "description": "A base64-encoded string describing, in algorithm specific format, the value of the soft binding to be used as the query."
          }
        },
        "required": ["softBindingValue"],
        "additionalProperties": false
      },
      "byBindingOutputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "endpoints": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uri"
            },
            "description": "The URL(s) of the Softbinding Resolution API that may resolve this manifest ID."
          },
          "manifestId": {
            "type": "string",
            "description": "The optional unique identifier of the C2PA manifest, used to retrieve specific metadata. This may be absent if the manifest ID is not published within the K-V store."
          }
        },
        "required": ["endpoints"],
        "additionalProperties": false
      }
    }
  }
]
```

<a id="_event_log_k_v_stores"></a>
#### 2.2.2. Event Log K-V Stores

In the case of `queryEventLog`, the JSON object contains three required sub-fields:

`smartContractAddress`: a hex address (`0x…​`) which specifies the address of the smart contract writing the event log entries, and thus the means to identify those log entries. `keyTopic`: The topic used to filter event logs for the soft binding key. `byBindingOutputSchema`: JSON schema describing how to parse the endpoint and manifest ID from an event log message. The format is identical to the identically named field described for the Smart Contract K-V Store case.

Example JSON for an Event Log K-V Store:

```json
[{
  "resolutionMethod": "eventLog",
  "queryEventLog": {
    "smartContractAddress": "0xDEF4567890ABCDEF1234567890ABCDEF12345678",
    "keyTopic": "topic1",
    "byBindingOutputSchema": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {
        "endpoints": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uri"
          },
          "description": "The URL(s) of the Softbinding Resolution API that may resolve this manifest ID."
        },
        "manifestId": {
          "type": "string",
          "description": "The optional unique identifier of the C2PA manifest, used to retrieve specific metadata. This may be absent if the manifest ID is not published within the K-V store."
        }
      },
      "required": ["endpoints"],
      "additionalProperties": false
    }
  }
}

]
```

<a id="_accessing_the_json_schema"></a>
#### 2.2.3. Accessing the JSON Schema

For EVM compatible chains, the Smart Contract referenced by the SBAL must implement a function `describe` as specified below, that returns the aforementioned JSON schema.

```none
/// @title C2PA Decentralized Manifest Resolution
interface C2PASoftBindingResolution  {
    /// @dev This returns a JSON schema describing how manifests may be
    ///  recovered using a soft binding identifier using either or both of a
    ///  smart contract call or the event log.
    function describe() external view returns (string _name);
    ....
```

> **NOTE:**
> Further definitions for Smart Contracts on non-EVM compatible DLTs may follow in future versions of this document.

# C2PA Soft Binding API

[![Creative Commons License](_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This document describes a proposed API for recovering manifests using a soft binding such as an invisible watermark or a fingerprint.

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "C2PA Soft Binding Resolution API",
    "description": "This is the OpenAPI specification of the C2PA Soft Binding Resolution API. This document specifies a web service API endpoint for matching soft bindings (e.g., watermarks or fingerprints) to C2PA Manifests.",
    "version": "1.0.0"
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
            "description": "Invalid query value",
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
            "description": "Invalid C2PA Manifest Id supplied",
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
      }
    },
    "securitySchemes": {
      "auth": {
        "type": "oauth2",
        "flows": {
          "implicit": {
            "authorizationUrl": "http://example.c2pa.org/oauth/dialog",
            "scopes": {
              "fetch:manifests": "search and read manifests within the manifest store."
            }
          }
        }
      }
    }
  }
}
```

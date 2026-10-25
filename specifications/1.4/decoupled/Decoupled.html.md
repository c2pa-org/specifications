# C2PA Decoupled API

[![Creative Commons License](_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This document describes a proposed API for communicating with manifest repositories.

```json
{
  "swagger": "2.0",
  "info": {
    "description": "A lookup service using soft bindings to identify matching C2PA manifests within a hosted manifest store.",
    "version": "1.0.0",
    "title": "C2PA Decoupled Lookup"
  },
  "host": "example.c2pa.org",
  "basePath": "/v1",
  "schemes": [
    "https",
    "http"
  ],
  "paths": {
    "/publish": {
      "post": {
        "tags": [
          "publish"
        ],
        "summary": "Add a new manifest to the manifest store.",
        "description": "",
        "operationId": "publishManifest",
        "consumes": [
          "multipart/form-data"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "formData",
            "name": "manifest",
            "type": "file",
            "description": "Manifest to add to the manifest store",
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation"
          },
          "400": {
            "description": "Invalid input"
          },
          "500": {
            "description": "Service failure"
          }
        },
        "security": [
          {
            "decoupled_auth": [
              "publish:manifests"
            ]
          }
        ]
      }
    },
    "/search/queryByBinding": {
      "get": {
        "tags": [
          "query"
        ],
        "summary": "Given an array of one or more soft bindings, find zero or more manifests within the manifest store matching each soft binding.",
        "description": "Multiple bindings may be submitted to issue multiple queries within one service call.  Multiple manifests may be returned for each soft binding.",
        "operationId": "queryByBinding",
        "consumes": [
          "multipart/form-data"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "maxResultsPerQuery",
            "in": "query",
            "description": "The maximum number of manifests to return for each query",
            "required": true,
            "type": "integer"
          },
          {
            "name": "queryBindings",
            "in": "query",
            "description": "The content bindings being used as query",
            "required": true,
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          {
            "name": "queryBindingTypes",
            "in": "query",
            "description": "The kind of content bindings being used as query (see soft binding registry)",
            "required": true,
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/c2pa.manifestID"
              }
            }
          },
          "400": {
            "description": "Invalid query value"
          },
          "500": {
            "description": "Service failure"
          }
        },
        "security": [
          {
            "decoupled_auth": [
              "fetch:manifests"
            ]
          }
        ]
      }
    },
    "/search/queryByContent": {
      "post": {
        "tags": [
          "query"
        ],
        "summary": "Find zero or more manifests within the manifest store using an uploaded file containing a sample of digital content.",
        "description": "",
        "operationId": "uploadFile",
        "consumes": [
          "multipart/form-data"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "maxResults",
            "in": "query",
            "description": "The maximum number of manifests to return for the query",
            "required": true,
            "type": "integer"
          },
          {
            "name": "manifest",
            "in": "formData",
            "type": "file",
            "description": "Manifest to add to the manifest store",
            "required": true
          },
          {
            "name": "queryBindingType",
            "in": "query",
            "description": "The kind of content binding being used as a query (see soft binding registry)",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/c2pa.manifestID"
              }
            }
          },
          "400": {
            "description": "Invalid asset type"
          },
          "500": {
            "description": "Service failure"
          }
        },
        "security": [
          {
            "decoupled_auth": [
              "fetch:manifests"
            ]
          }
        ]
      }
    },
    "/manifest/{manifestId}": {
      "get": {
        "tags": [
          "fetch"
        ],
        "summary": "Retrieve a single manifest by manifest ID",
        "description": "Returns a single manifest",
        "operationId": "getManifestById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "manifestId",
            "in": "path",
            "description": "ID of the manifest to return",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "schema": {
              "$ref": "#/definitions/c2pa.manifest"
            }
          },
          "400": {
            "description": "Invalid Manifest ID supplied"
          },
          "404": {
            "description": "Manifest ID not found"
          },
          "500": {
            "description": "Service failure"
          }
        },
        "security": [
          {
            "decoupled_auth": [
              "fetch:manifests"
            ]
          }
        ]
      },
      "delete": {
        "tags": [
          "delete"
        ],
        "summary": "Delete a single manifest from the manifest store",
        "description": "Given a manifest ID, remove the matching manifest from the manifest store.",
        "operationId": "deleteManifest",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "manifestId",
            "in": "path",
            "description": "Unique ID of the manifest to delete",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation"
          },
          "400": {
            "description": "Invalid Manifest ID supplied"
          },
          "404": {
            "description": "Manifest not found"
          },
          "500": {
            "description": "Service failure"
          }
        },
        "security": [
          {
            "decoupled_auth": [
              "delete:manifests"
            ]
          }
        ]
      }
    },
    "/service/getSupportedBindings": {
      "get": {
        "tags": [
          "service"
        ],
        "summary": "Enumerate content bindings supported as queries by lookup service (as defined in the soft binding registry)",
        "description": "Returns a list of the soft bindings supported by the lookup service",
        "operationId": "getSupportedBindings",
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "Successful operation",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/c2pa.bindingList"
              }
            }
          },
          "500": {
            "description": "Service failure"
          }
        }
      }
    }
  },
  "securityDefinitions": {
    "decoupled_auth": {
      "type": "oauth2",
      "authorizationUrl": "http://example.c2pa.org/oauth/dialog",
      "flow": "implicit",
      "scopes": {
        "publish:manifests": "publish new manifests to the manifest store",
        "delete:manifests": "remove manifests from the manifest store",
        "fetch:manifests": "search and read manifests within the manifest store"
      }
    }
  },
  "definitions": {
    "c2pa.manifestID": {
      "type": "string",
      "pattern": "^https://[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b[-a-zA-Z0-9@:%_\\+.~#?&//=]*$",
      "description": "identifier of a C2PA manifest"
    },
    "c2pa.manifest": {
      "type": "string",
      "description": "a C2PA manifest (CBOR binary blob)"
    },
    "c2pa.bindingList": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "list of content bindings (algs) supported"
    }
  },
  "externalDocs": {
    "description": "C2PA Specification",
    "url": "https://c2pa.org/specifications"
  }
}
```

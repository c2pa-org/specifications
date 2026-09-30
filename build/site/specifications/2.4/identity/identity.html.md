# Human and Organizational Identity Recommendation

[![Creative Commons License](_images/CCby4.png)](https://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

<a id="_recommendation_summary"></a>
## 1\. Recommendation summary

For implementors and users wanting to express human or organizational provenance in a [C2PA Content Credential](../../2.2/specs/C2PA_Specification.html.md), the C2PA recommends the use of the [Creator Assertions Working Group (CAWG) specifications](https://cawg.io/specs/). **Organizations** wanting to assert their identity in C2PA Manifests should use the CAWG’s [Organizational Identity Profile for Content Credentials](https://cawg.io/organizational-identity-profile/1.0/).

Implementations that are generating C2PA Manifests and making assertions as themselves should use the [C2PA claim signature](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html.md#_claim_and_claim_signature) mechanism, in combination with a certificate issued as part of the [C2PA Conformance Program](https://c2pa.org/conformance/).

<a id="_background_on_identity_in_c2pa_and_the_ecosystem"></a>
## 2\. Background on identity in C2PA and the ecosystem

Since version 2.0 of the Content Credentials specification, the C2PA organization has focussed on representing "machine" identity in a Content Credential, where "machine" is typically an application, service or hardware product that generates or modifies content as the "claim signer", which the [C2PA Conformance Program](https://c2pa.org/conformance/) terms the **Generator Product**.

This can be seen in the specification in a couple of places, firstly in the two types of assertions - "created" and "gathered". Created assertions are those that are made / originated by the claim signer. Gathered assertions are explicitly not attributed to or made by a claim signer, and typically come from other sources.

The second place this is seen is the selection of "standard assertions" defined in the specification, which have been chosen to represent the kinds of information that claim signers would typically want to be able to assert.

However, a claim generator is often acting on behalf of a human or organization, and in these cases it is important to creators and consumers that they be able to represent their identity as part of the C2PA Manifest. This is particularly important in scenarios where content authenticity and provenance are being used to establish trust in the content, for example in news media, where the identity of the human or organization behind the content is often critically important to consumers.

While the C2PA core "standard assertions" are focussed on machine-originated claims, the C2PA specification defines an extension mechanism for the definition of other types of assertions. Other bodies have defined their own C2PA assertion specifications to allow non-machine claims to be expressed, such as in the [CAWG specifications](https://cawg.io/specs/).

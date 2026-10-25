# C2PA User Experience Guidance for Implementers

[![Creative Commons License](../../1.1/ux/_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

<a id="_introduction"></a>
## 1\. Introduction

The C2PA intends to provide clear guidance for implementers of provenance-enabled user experiences (UX). Developing these recommendations is an ongoing process that involves diverse stakeholders. The results will balance uniformity and familiarity with utility and flexibility for users across contexts, platforms, and devices. Our intent is to present a comprehensive range of conventions for the user experience and evolve them based on feedback. Please reference the Glossary in the [C2PA Specifications](../specs/C2PA_Specification.html.md#glossary) for clarifications on terminology used within this document. For general guidance on other areas of the specification, please see [Guidance for Implementors](../guidance/Guidance.html.md).

<a id="_principles"></a>
## 2\. Principles

The UX recommendations aim to define best practices for presenting C2PA provenance to consumers. The recommendations strive to describe standard, readily recognizable experiences that:

*   provide asset creators a means to capture information and history about the content they are creating, and
    
*   provide asset consumers information and history about the content they are experiencing, thereby empowering them to understand where it came from and decide how much to trust it.
    

User interfaces designed for the consumption of C2PA provenance must be informed by the context of the asset. C2PA have studied four primary user groups and a collection of contexts in which C2PA assets are encountered. These user groups have been defined in the [C2PA Guiding Principles](https://c2pa.org/principles/) as Consumers, Creators, Publishers and Verifiers (or Investigators). To serve the needs of each of these groups across common contexts, exemplary user interfaces are presented for many common cases. These are recommendations, not mandates, and we expect best practices to evolve.

<a id="_designing_for_trust"></a>
### 2.1. Designing for trust

A unique aspect of this approach is that rather than attempt to determine the veracity of an asset for a user, it enables users themselves to judge by presenting the most salient and/or comprehensive provenance information. As such it is critical that users develop trust in the system itself, over the individual data presented. Exposing the C2PA Trust Model and Trust Signals in a way that balances transparency and intuitiveness is the critical design goal addressed here. There is no design pattern that can guarantee to engender trustworthiness across multiple contexts, and while a degree of contextual customization is anticipated, C2PA recommends all implementations adhere to the following general principles.

<a id="_quality"></a>
### 2.2. Quality

Implementations should be created using industry standard, robust user interface technologies.

<a id="_accessibility"></a>
### 2.3. Accessibility

Implementations should adhere to accepted, current accessibility standards to ensure no users are excluded. For an example of such criteria, see the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/).

<a id="_consistency"></a>
### 2.4. Consistency

Wherever suitable, UX patterns should match those outlined here. In the case that this would break contextual paradigms of the platform, lean on precedent whether in the OS or app design. Users should not have to learn new paradigms or terminology in different contexts in order to access the information.

<a id="_summary_vs_comprehensive"></a>
### 2.5. Summary vs comprehensive

In many cases, a subset of the available information will be the most useful to a user in a given context. A link to the full information should always be made available, however.

<a id="_linked"></a>
### 2.6. Linked

Some data will assert an individual or organizational identity. Wherever possible, a link to information about the identity should be made available to allow the user to make a judgement on those actors' trustworthiness.

<a id="_levels_of_information_disclosure"></a>
## 3\. Levels of information disclosure

Because the complete set of C2PA data for a given asset can be overwhelming to a user, C2PA describes four levels of progressive disclosure which guide the designs:

![image$disclosure summary 2x](../../1.1/ux/_images/disclosure_summary_2x.png)

Figure 1. Disclosure levels

Level 1

An indication that C2PA data is present and its cryptographic validation status.

Level 2

A summary of C2PA data available for a given asset. Should provide enough information for the particular content, user, and context to allow the consumer to understand to a sufficient degree how the asset came to its current state.

Level 3

A detailed display of all relevant provenance data. Note that the relevance of certain items over others is contextual and determined by the UX implementer.

Level 4

For sophisticated, forensic investigatory usage, a standalone tool capable of revealing all the granular detail of signatures and trust signals is recommended. In addition to these standard levels, there will be common tools available for those interested in a full forensic view of the provenance data. This would reveal all available C2PA data across all manifests for an asset, including signature details.

<a id="_l1_indicator_of_c2pa_data"></a>
## 4\. L1 – indicator of C2PA data

![image$L1 display options 2x](../../1.1/ux/_images/L1-display-options_2x.png)

Figure 2. The L1 indicator

<a id="_appearance"></a>
### 4.1. Appearance

Following the consistency principle, it is important in developing trust that users can learn to easily recognize the presence of the system and that their expectations are met regardless of context. As such, the L1 indicator should be consistent in its appearance across all contexts and devices to the degree that it clearly represents the presence of C2PA data. L1 can be applied using only the icon, the title, or both. If using the icon alone, ensure its appearance meets accessibility criteria so that consumers can easily identify its presence on or near the C2PA-enabled content. We recommend using the placeholder “information seal” icon and working title “Content Credentials” for recognition and learned understanding of C2PA-enabled content. We may make updates to the icon and product name in upcoming versions of this document as we gather findings from on-going user research.

<a id="_placement_and_interaction"></a>
### 4.2. Placement and interaction

For flexibility across implementations, there are several recommended placements for L1 indicators when C2PA-enabled content is present: on top of the content or somewhere close enough that its relationship to the content is clear. If L1 is positioned on top of the content, a hover state may be applied so as not to permanently obstruct the content below. Applications may differ depending on device, such as revealing L1 via long-press on mobile. Partially overlapping the L1 indicator over content is the most robust option to avoid potential misuse in the scenario that it has been purposefully added to content in a way meant to deceive. A new user experience guidance is recommended for initial implementation rollout to make clear how to identify L1 indicators.

Behaviour of L1 indicators should reveal L2 progressive disclosure, either via a hover or click interaction. Within L2 user interfaces, L1 can continue to be used to indicate the presence of C2PA-enabled ingredients.

<a id="_validation_states"></a>
### 4.3. Validation states

![image$L1 states 2x](../../1.1/ux/_images/L1-states_2x.png)

Figure 3. L1 validation states

In the event that the active manifest is incomplete or invalid, a stateful indicator of data validation can be displayed. There are several scenarios when displaying a data validation state may be necessary. See Chapter 14. Validation in the [C2PA Technical Specifications](../specs/C2PA_Specification.html.md) for further information.

<a id="l1-language"></a>
### 4.4. L1 interface language

It is important to align any interface language with the recommended terminology and phrases. This lets terminology retain the same meaning and weight across experiences, which is best for user comprehension. It also ensures the value and adoption of content provenance, thus making C2PA data easier to understand and promote across a large ecosystem.

For customization of UI elements, use the recommended terms or customize with user comprehension in mind.

In the following table, we recommend terminology for consumer-facing L1 UI:

**Table 1. L1 recommended content terms and descriptions**

| Term/phrase | Description | Usage notes |
| --- | --- | --- |
| Content credentials | Content provenance and attribution data | *   Use title case when referring to the system name and sentence case when referring to the data itself      *   As a reminder, this is a working title and is subject to change |
| Incomplete | Someone has changed this content without updating the content credentials, so there may be unexplained changes. | Consider pairing with a visual indicator that suggests users proceed with caution when viewing C2PA data |
| Invalid | Someone has changed or tampered with the content credentials, so the available data should be disregarded | Consider pairing with a visual indicator that conveys clear negativity and risk so users can understand the C2PA data should not be used to assess the content |

<a id="l2-section"></a>
## 5\. L2 – provenance summaries

<a id="_minimum_viable_provenance"></a>
### 5.1. Minimum viable provenance

![image$discrete 1 2x](../../1.1/ux/_images/discrete-1_2x.png)

Figure 4. Minimum viable provenance display

If L1 indicates the presence of C2PA data, L2 is where consumers can begin to view and interact with the data. The minimum L2 user experience is defined as the display of nothing more than the base required C2PA manifest data: the signing entity, the claim generator and date. The signer is a top trust signal that allows the consumers to make their judgement trusting that the information available has been 'backed' by a legitimate entity. C2PA anticipates that additional varying assertion data will be included by implementers, and recommends including the manifest thumbnail, signer logo, and a link to L3 where consumers can find more provenance data if available.

L2 styles, fonts, etc. can be customized to fit the given context. Iconography and terminology used to describe assertions should be consistent wherever possible. C2PA anticipates the need for L2 generally to be space-efficient as it appears within the implementer’s context. Therefore it is suggested the data displayed be streamlined to provide enough information for the particular content, user, and context, allowing the consumer to understand to a sufficient degree how the asset came to its current state.

<a id="_depth_versus_breadth"></a>
### 5.2. Depth versus breadth

L2 UI options are displayed along a spectrum from depth of information to breadth of provenance representation. In the figure below, the left side represents a single manifest summary and the right side represents the complete provenance summary depicting multiple manifests. However, the middle example shows a customized provenance summary wherein certain manifest assertions are highlighted. This flexibility allows implementers to show more depth for a given subset of manifests.

![image$L2 spectrum 2x](../../1.1/ux/_images/L2_spectrum_2x.png)

Figure 5. Provenance summary depth versus breadth

In order to summarize the data in a context-specific manner, it is recommended that consideration is given to what balance of **depth** and **breadth** of data will be most relevant to users. For example, if a given piece of content has only one manifest, consider displaying more of its assertion data, as in [Figure 6. A single manifest summary](#manifest-summary). If there are multiple manifests, then depicting the entire provenance summary may give users a more complete understanding of the content’s history, such as in [Figure 8. Provenance summary, three manifests](#provenance-summary). However, in all likelihood there will be many cases that fall in between, like in [Figure 12. Customized summary combinations](#provenance-combinations). The following sections will further document UI options along this spectrum.

<a id="_manifest_summaries_depth"></a>
### 5.3. Manifest summaries (depth)

![image$L2 depth 2x](../../1.1/ux/_images/L2_depth_2x.png)

Figure 6. A single manifest summary

A manifest summary only represents a single manifest. It could be the active manifest, as this is the most recent version tied to the C2PA-enabled content, or an ingredient manifest as determined by the implementer. The determination for displaying an ingredient manifest should be if there is substantive assertion data the implementer believes is more relevant to its audience than that of the active manifest. A shortcoming of displaying a single manifest summary is that it may not represent the complete history of the C2PA-enabled content, and may require consumers to navigate away from the implementer’s context to L3 to learn more.

<a id="_provenance_summaries_breadth"></a>
### 5.4. Provenance summaries (breadth)

A provenance summary represents the collection of manifests related to the C2PA-enabled content. Manifests should be presented in the order that they are referenced via ingredient assertions, starting with the active manifest at the top and ending with the origin ingredients below. Origin ingredients represent the beginning of their respective history branches.

![image$summary 1 2x](../../1.1/ux/_images/summary-1_2x.png)

Figure 7. Provenance summary, two manifests

Summary displays should show at minimum the origin ingredients and active manifests, or if screen real estate allows, with at least one manifest in between.

![image$summary 2 2x](../../1.1/ux/_images/summary-2_2x.png)

Figure 8. Provenance summary, three manifests

In order to provide users with a succinct summary and to allow for limited screen real estate, the manifests in between origin and active can be collapsed and represented as a numerical count. C2PA recommends a baseline rule for collapsing manifests if the total number exceeds four. However, this threshold can be altered according to context. In keeping with the core recommendations, a link to the full set of data in L3 should always follow the summary list of manifests.

![image$summary 3 2x](../../1.1/ux/_images/summary-3_2x.png)

Figure 9. Provenance summary, four manifests

When multiple origins are present, either as multiple ingredients in a single manifest or across multiple manifests, they can be summarized in the origin section of the UI. The L1 indicator can be used as a badge on ingredient thumbnails to distinguish C2PA-enabled assets.

![image$summary 4 2x](../../1.1/ux/_images/summary-4_2x.png)

Figure 10. Provenance summary, two origins

L2 UI is flexible enough to allow for various combinations of manifest counts and origin assets.

![image$summary 5 2x](../../1.1/ux/_images/summary-5_2x.png)

Figure 11. Provenance summary, multiple origins and manifests

<a id="_combinatory_summaries"></a>
### 5.5. Combinatory summaries

Implementers should consider audience needs when weighing the balance of depth and breadth in combinatory summaries in order to concisely display the most complete and relevant representation of content provenance. For example, travel companies may opt to display location assertions from the origin manifest in a provenance summary so as to provide their users with key information. Similarly, a news publisher may choose to show action assertions from an ingredient manifest to disclose edits that occurred to published content.

![image$L2 middle 2x](../../1.1/ux/_images/L2_middle_2x.png)

Figure 12. Customized summary combinations

<a id="_validation_states_2"></a>
### 5.6. Validation states

<a id="_incomplete_states"></a>
#### 5.6.1. Incomplete states

There will be instances when C2PA-enabled content is incomplete data. Most commonly, this will happen if the content is edited without capturing C2PA data. In this event, the L1, L2 and L3 UI should reflect when data is incomplete, as well as the manifest data that came before or after. A dotted line can be drawn between manifests to suggest the connection is not the same as between valid, intact manifests. Incomplete data should not automatically signal that one should discount the content as untrustworthy. For this reason, C2PA discourages the use of an indicator designed to trigger alarm, which should be reserved for more apparent tamper-evident use cases, in favour of a more descriptive and neutral indicator.

![image$error 1 2x](../../1.1/ux/_images/error-1_2x.png)

Figure 13. Incomplete data in the active manifest position

![image$error 4 2x](../../1.1/ux/_images/error-4_2x.png)

Figure 14. Incomplete data in an ingredient position

Following the established pattern of collapsing additional manifests, incomplete data can be called out via the text string to bring awareness to the questionable validity of ingredients.

![image$error 2 2x](../../1.1/ux/_images/error-2_2x.png)

Figure 15. Incomplete data collapsed

<a id="_invalid_states"></a>
#### 5.6.2. Invalid states

There may be instances when C2PA-enabled content has been maliciously edited to tamper with C2PA data, or is signed by an untrusted entity. In this case, no additional prior data can be displayed.

![image$error 5 2x](../../1.1/ux/_images/error-5_2x.png)

Figure 16. Invalid data in the active manifest position

![image$error 3 2x](../../1.1/ux/_images/error-3_2x.png)

Figure 17. Invalid data in an ingredient position

<a id="_l2_interface_language"></a>
### 5.7. L2 interface language

Please refer to [L1 interface language](#l1-language) for a reminder of the importance of adhering to recommended terms and descriptions. The following table contains terminology for UI elements such as commonly used categories and validation states:

**Table 2. L2 recommended content terms and descriptions**

| Term/phrase | Description | Usage notes |
| --- | --- | --- |
| Content credentials | Content provenance and attribution data | *   Consider using as a UI header to contextualize C2PA data displays      *   As a reminder, this is a working title and is under discussion |
| Signed by / Signer | The signer is responsible for the trustworthiness of the content and its C2PA data | Must be displayed |
| Date and timestamp | The time and time zone at which the signer signed the manifest | *   Recommended inclusion to accompany signer      *   Appearance of formatting should be localized to consumer’s region |
| Edits and activity | Actions taken on the asset | Upcoming UX recommendations will attempt to standardize categorizations of actions for user comprehension |
| Assets used / Assets | Ingredients used in a given manifest | Recommended display for discrete manifest summaries |
| Produced by / Producer | The name and role of the person identified by the active manifest as its producer | *   Consider a customization or UI pattern to clarify how identity is being validated (see more in [creator identity](#identity))      *   This term is intended to represent a diverse range of roles, but can be customized based on the CreativeWork assertion |
| Content credentials are incomplete | Someone has changed this content without updating the content credentials, so there may be unexplained changes | Should follow L1 validation state |
| Content credentials are invalid | Someone has changed or tampered with the content credentials, so the available data should be disregarded | Should follow L1 validation state |
| Additional manifests | There are # additional manifests in this provenance line | Use to represent manifest count when there are four or more manifests in the provenance summary |
| Additional manifests and incomplete content credentials | There are # additional manifests in this provenance line, and some have incomplete data | Use to represent manifest count when there are four or more manifests in the provenance summary and one or more are incomplete |

<a id="_video"></a>
## 6\. Video

Since video is a temporal medium, it poses significant challenges to distilling provenance data into simple, consumer-friendly displays. This is due to the potential for high volumes of composited ingredients of varying media formats, applied complex edit actions, spanning multiple software and people. These UX recommendations are focused on a starting point for video provenance and will address more complex uses over time.

<a id="_l1_in_player"></a>
### 6.1. L1 in player

A notable difference with video content is the necessity for a player for viewing. This limits the ways in which an L1 indicator of C2PA data can be placed on the content and interacted with, and may likely require an integration into the player itself. However, the L1 indicator may still be placed next to the video outside of the content.

![image$video 1 2x](../../1.1/ux/_images/video-1_2x.png)

Figure 18. Video L1

<a id="_l2_displays"></a>
### 6.2. L2 displays

Video L2 displays should largely follow the same patterns as described in [L2 – progressive disclosures](#L2 – progressive disclosures). However, for now we stop short of recommending the inclusion of ingredients or non-C2PA origin content due to the potential complexity of volume. Instead, we suggest showing a minimal manifest summary or provenance summary.

![image$video 2 2x](../../1.1/ux/_images/video-2_2x.png)

Figure 19. Video L2 minimum viable provenance

![image$video 3 2x](../../1.1/ux/_images/video-3_2x.png)

Figure 20. Video L2 provenance summary

An important detail for video UX is the L2 thumbnail displays. Video thumbnails should be represented as either the poster attribute as defined by the creation platform, or the first frame of the video generated at manifest creation. To help distinguish video assets from images, a filmstrip icon is added to the thumbnail to depict its media type.

We anticipate supporting time-coded assertions in future versions of the spec, but in the near term, we recommend following [L2 conventions](#l2-section) as described above.

<a id="_creator_experience"></a>
## 7\. Creator experience

<a id="_opting_in_privacy_and_data_collection"></a>
### 7.1. Opting in, privacy and data collection

In this section, the term _creator_ means a party creating _manifests_. This could be the maker of an original work, an editor, or anyone else utilizing C2PA-enabled tools to add to the provenance chain.

As per the [C2PA Guiding Principles](https://c2pa.org/principles/), C2PA implementations should provide a mechanism for creators of a given content to assert, in a verifiable manner, any information they wish to disclose about the creation of that content and any actions taken since the asset’s creation. As such, the creator experience requires the following:

*   A clear acknowledgement of creator consent before a C2PA implementation can begin accumulating data;
    
*   Disclosure or preview of the nature of information that is being recorded;
    
*   Creator control over recorded information, with particular sensitivity to the creator’s identity and process.
    

C2PA recommends an opt-in flow that concisely represents these requirements and can be opted-out of just as easily at any time. Once opted-in, creators should be able to distinguish between non-removable information as defined by the C2PA specifications and information that can be adjusted according to the user’s preferences.

<a id="_creator_settings_and_manifest_preview"></a>
### 7.2. Creator settings and manifest preview

Creators should be able to control the information in their assertions as much as is allowed by C2PA specifications. The [Harms Modelling document](../security/Harms_Modelling.html.md) covers the reasoning behind why creator control is imperative. To provide coverage against harms and misuse, C2PA suggests the following types of assertions be manageable by the creator:

*   Identity information
    
*   Actions
    
*   Creative Work
    
*   Fields pertaining to copyright, descriptions, and usage rights
    
*   Exif information and related metadata
    

To be accommodating to the user’s preferences, C2PA recommends presenting a UI wherein these assertion categories can be toggled on or off on a per document basis. To assist the creator in understanding the tradeoffs they are making, C2PA also suggests displaying a manifest preview that concisely and accurately depicts what information will be added into the manifest.

<a id="identity"></a>
### 7.3. Identity

The identity of the creator, or lack thereof, is an important assertion for the completion of a content’s provenance as it helps consumers understand who is responsible for what happened. It is important to restate that C2PA specifications do not require the identities of persons or organizations making any assertion about an asset to be documented. However, the challenge of validating identity when provided is beyond the scope of the C2PA specification at present. As such, C2PA recommends several tactics to help consumers understand the role of identity in C2PA provenance.

The first is to make clear when the creator’s identity is self-assigned. The second is to offer creators the ability to add social media or other verifiable accounts. These identity flows may lie outside of C2PA creator implementations, but when included, have the added benefit of providing a degree of proof for creators as well as links to their presence elsewhere on the internet.

When the creator decides to opt out of including their identity information, C2PA recommends promptly updating the manifest preview to reflect this change to give the creator immediate assurance their privacy is being protected.

<a id="_actions"></a>
### 7.4. Actions

Similar to the treatment of identity, some creators may want to reserve the right to not disclose the actions they’ve taken on a given piece of content. While some use cases, like photojournalism, should always show transparently what actions took place, this is less important for more creative and artistic applications. In some cases, creators may want to protect their particular creation process and should therefore be allowed to opt out of including actions in their manifests.

Granularity of actions is worth considering in creator implementations. In some cases, grouping actions into high level categories may be more understandable for consumers, versus presenting a list of detailed, creation-specific actions that may be unique to the implementation. C2PA recommends striking a balance between clarity and information overload based on the intended audience of the implementing platform.

<a id="_ingredients_and_their_validation_state"></a>
### 7.5. Ingredients and their validation state

Ingredient assertions represent a form of non-removable information because they are the key to the establishment of the provenance of an asset and may themselves contain provenance. As such, ingredients are a requirement to be displayed in the manifest and its creator-side preview.

Validation of an ingredient’s manifest is equally important to convey to creators prior to producing a new manifest. Within the manifest preview UI, C2PA recommends displaying a list of ingredient thumbnails and their validation states to ensure the user working with those ingredients is aware of additional provenance data. This is particularly important for cases when ingredients are unable to validate or contain an invalid manifest. A clear example might be a news editor who receives a piece of user-generated content that purports to depict a controversial scene - alerting the editor to the validation state of that image will give them stronger assurances of whether that content is trustworthy.

<a id="_exporting"></a>
### 7.6. Exporting

The [C2PA Implementation Guidance](../guidance/Guidance.html.md) recommends that a manifest be created for an asset when a significant event in the lifecycle of the asset takes place, such as its initial creation or an "export" operation from an editing tool. This is in part due to the underlying technical process of digitally signing the manifest, but also aligns with natural creation workflows. When a creator is ready to export their work, they should be able to decide whether or not to attach the accumulated assertion data to their content. Not every piece of exported content is in need of provenance data, so C2PA recommends enabling the option of attachment on a per document basis. It will also help serve as a reminder to creators that they have opted into the C2PA implementation, which will allow them to protect their privacy as needed.

<a id="_communication_and_education"></a>
## 8\. Communication and education

To ensure user comprehension, it is crucial that implementers consider how their audiences are introduced to C2PA provenance data and the value to be gained from engaging with it. We recommend providing creator and consumer educational experiences and strongly encourage the use of language consistent to what is provided in these guidelines. Keeping communication and education aligned is a key part of promoting comprehension, value, and adoption of C2PA data by implementers, creators, and consumers.

Depending on the implementer’s platform and audience, there are different ways to effectively incorporate education around C2PA data. We suggest utilizing standard UI elements like links, tooltips, and modals to provide users with opportunities to seek out more information regarding the implementation or a component piece within. Certain L2 UI elements, like assertion categories, may warrant additional explanations to ensure user comprehension. For larger and more detailed explanations, implementers should consider linking out to FAQs or dedicated information pages so audiences can learn more about C2PA from a native product voice. However, when making content customizations, make sure things like brand voice are not prioritized in sacrifice of clarity and user comprehension.

<a id="_open_issues"></a>
## 9\. Open issues

<a id="_user_research"></a>
### 9.1. User research

Correctly identifying and displaying trust signals is of paramount concern for our overall user experience. C2PA strives to understand the value consumers will apply to content attribution through ongoing user research studies and usability testing.

<a id="_applications_use_cases_and_additional_media_formats"></a>
### 9.2. Applications, use cases, and additional media formats

Pending user research, C2PA will provide implementors with recommended L2 customizations based on combinations of content, audiences, and platforms. Examples may include news publishers, social sites, e-commerce and retail, travel, and entertainment platforms. The recommendations for video UX will also continue to expand in scope and complexity, along with the introduction of other media formats like audio and streaming content.

<a id="_l3_recommendations"></a>
### 9.3. L3 recommendations

While this document primarily covers L1 and L2 consumer experiences, we aim to provide recommendations for the design of L3 interfaces, wherein users can explore a more detailed display of provenance data.

<a id="_public_review_feedback_and_evolution"></a>
## 10\. Public review, feedback and evolution

The team authoring the UX recommendations is cognizant of its limitations and potential biases, recognizing that feedback, review, user testing and ongoing evolution is a requirement for success. This guidance is therefore an evolving document, informed by real world experiences deploying C2PA UX across a wide variety of applications and scenarios.

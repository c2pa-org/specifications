# C2PA User Experience Guidance for Implementers

[![Creative Commons License](../_images/CCby4.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

<a id="_introduction"></a>
## 1\. Introduction

The C2PA intends to provide clear guidance for implementers of Content Credentials user experiences (UX). Developing these recommendations is an ongoing process that involves diverse stakeholders. The results will balance uniformity and familiarity with utility and flexibility for users across contexts, platforms, and devices. Our intent is to present a comprehensive range of conventions for the user experience and evolve them based on feedback. Please reference the Glossary in the [C2PA Specifications](../specs/C2PA_Specification.html.md#_glossary) for clarifications on terminology used within this document. For general guidance on other areas of the specification, please see [Guidance for Implementors](../guidance/Guidance.html.md).

<a id="_principles"></a>
## 2\. Principles

These UX recommendations define best practices for presenting Content Credentials to creators and consumers. The recommendations describe standard, readily recognizable experiences that:

*   provide asset creators a means to capture information and history about the content they are creating, and
    
*   provide asset consumers information and history about the content they are experiencing, thereby empowering them to understand its provenance and decide how much to trust it.
    

User interfaces designed for the consumption of Content Credentials must be informed by the context of the asset. C2PA have studied four primary user groups and a collection of contexts in which C2PA assets are encountered. These user groups have been defined in the [C2PA Guiding Principles](https://c2pa.org/principles/) as Consumers, Creators, Publishers and Verifiers (or Investigators). To serve the needs of each of these groups across common contexts, exemplary user interfaces are presented for many common cases. These are recommendations, not mandates, and we expect best practices to evolve.

<a id="_designing_for_trust"></a>
### 2.1. Designing for trust

Build user confidence through transparent, reliable interfaces. Instead of asserting definitive claims about an asset’s authenticity, empower users with access to Content Credentials information that helps them make informed judgments. The interface should clearly indicate when Content Credentials are present and visually reinforce trust signals, such as verified identities or validated sources. Trust is bolstered by UX that consistently meets expectations, offers explanations when things go wrong, and presents provenance information in a way that respects user context and comprehension.

<a id="_quality"></a>
### 2.2. Quality

Leverage platform-native design standards and scalable UI technologies. Every visual and interactive element should feel intentional and polished, delivering a sense of coherence and craftsmanship. Ensure smooth animations, responsive feedback, and thoughtful transitions that make the experience feel premium and deliberate. Performance should never compromise the delivery of provenance data.

<a id="_consistency"></a>
### 2.3. Consistency

Apply familiar interaction patterns and language throughout the experience. If your platform uses bottom sheets, modals, or popovers, provenance information should follow the same patterns. Consistent labeling, iconography, and positioning help reduce cognitive load and allow users to develop a reliable mental model across applications and content types.

<a id="_accessibility"></a>
### 2.4. Accessibility

Ensure inclusive design by supporting screen readers, keyboard navigation, high contrast modes, and scalable text. Follow guidelines like [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/) to make provenance data navigable and meaningful to users with a wide range of abilities.

All Content Credentials visual indicators must include text alternatives and be logically placed within the accessibility tree. Any content that appears through long-press, hover state, or comparable interaction patterns must be interactable without disappearing unexpectedly.

<a id="_screen_adaptability"></a>
### 2.5. Screen Adaptability

Ensure that Content Credentials UI adapts fluidly across screen sizes. Use intuitive gestures and UI elements to unlock deeper layers of provenance.

On mobile or touch platforms, the L1 indicator can be revealed on tap or as part of a controls overlay. Long-press or contextual menus may also be appropriate. Use bottom sheets, collapsible menus, or carousels for L2 and L3 summaries. Ensure every interaction has a clear target and delivers instant, unambiguous feedback. Maintain touch target sizing, responsive layouts, and adaptive typography in consistency with other native UI elements.

On larger screens, a hover or click could reveal an L2 popover, and in L3 displays, Content Credentials provenance can appear side-by-side with the relevant content.

<a id="_progressive_disclosure"></a>
### 2.6. Progressive Disclosure

Structure content to reveal only what is needed in a given moment. Start with a lightweight cue (like the Content Credentials icon), and allow users to access summary views (L2) or full manifests (L3) as needed. This layered approach respects user attention while making detailed data accessible for those who seek it.

<a id="_education_and_communication"></a>
### 2.7. Education and Communication

Introduce Content Credentials gently through in-product education, such as tooltips, onboarding modals, or contextual help. Use plain language to explain terms like “manifest” and tailor explanations to the user’s level of familiarity. Consider progressive learning paths where more advanced concepts are introduced only when needed.

<a id="_continuous_feedback"></a>
### 2.8. Continuous Feedback

Encourage contributions from users and implementers. Feedback mechanisms might include UI prompts like “Was this helpful?” or open-source feedback opportunities. Regularly evolve the UX based on real-world usage, bug reports, and behavioral insights.

<a id="_patterns"></a>
## 3\. Patterns

<a id="_levels_of_information_disclosure"></a>
### 3.1. Levels of Information Disclosure

C2PA strongly recommends utilizing a four-tier system of direct disclosures to help users explore provenance and access appropriate levels of information based on their needs and technical familiarity. Each disclosure level is designed to provide a tailored experience that supports user comprehension and exploration. Smooth transitions between layers are essential—users should always be able to return to previous views, dismiss overlays, or access additional help. By respecting context and user intent, these disclosure levels foster trust and transparency without overwhelming or confusing the audience.

<a id="_level_1_l1"></a>
#### 3.1.1. Level 1 (L1)

This is the entry point for provenance. A lightweight visual indicator communicates the presence of Content Credentials data and the validation status of the content—well-formed, valid, and trusted. The C2PA recommends the Content Credentials icon as the default visual display, but other informational icons or text strings can be sufficient to use as well. Its goal is to be quickly scannable and easily understood. The L1 element must be persistent enough to build user familiarity but unobtrusive to the surrounding content.

<a id="_level_2_l2"></a>
#### 3.1.2. Level 2 (L2)

This level offers a compact summary of provenance data, useful for typical consumers. It includes key information such as the signer, a trusted timestamp (if present), information about the inception action, and supporting source descriptions, if applicable . L2 must be optimized for quick scanning and comprehension, serving as a confidence signal without overwhelming users. On devices with limited screen space, a progressive layout should prioritize the most salient information.

<a id="_level_3_l3"></a>
#### 3.1.3. Level 3 (L3)

At this level, a detailed breakdown of the asset’s full provenance is available. This includes not only the signer, but all relevant assertions tied to it, such as editing history, attribution (if applicable), and ingredient relationships. L3 should support structured navigation and filtering, allowing users to explore data based on categories like actions taken, entities involved, or chronology. L3 may include nested manifest structures, which should be presented in a way that supports traceability and exploration.

<a id="_level_4_l4"></a>
#### 3.1.4. Level 4 (L4)

A specialized interface for forensic or investigatory use. It exposes the full technical detail of all Content Credentials-related data. This level is typically used by journalists, forensic experts, or legal teams who need to verify the full authenticity of an asset in a granular way. L4 interfaces are usually offered via dedicated tools, external to the consumer-facing UI.

<a id="_language_and_terminology"></a>
### 3.2. Language and Terminology

Consistency in terminology across implementations aids general creator and consumer understanding. Key recommended terms include:

*   "Content Credentials"
    
*   "Signed by \[name\]" (instead of technical terms like 'claim generator')
    
*   "Produced by", "Used in", "Edited on" for additional descriptors
    

Avoid technical jargon unless providing an optional detail view or glossary. Prioritize clarity and comprehension.

<a id="_content_credentials_branding"></a>
#### 3.2.1. Content Credentials Branding

The phrase “Content Credentials” is a branded term used to describe implementations of the C2PA specification. As this is a branded term, use title case when referring to the system name and sentence case when referring to the data itself. Implementers should use “Content Credentials” in place of references to “C2PA” when referring to provenance data. “C2PA” should only be used to reference the standards organization driving the design and adoption of Content Credentials.

<a id="_localization"></a>
#### 3.2.2. Localization

Because “Content Credentials” is a brand name, avoid direct translations of it as the meaning may be slightly different across languages. However, when possible, the rest of the Content Credentials provenance information should be localized for readability across different regions.

<a id="_materiality"></a>
### 3.3. Materiality

<a id="_actions"></a>
#### 3.3.1. Actions

Content Credentials can be used to record changes to content over time. Creative tools and hardware that support the creation or editing of content can record information about the edits or other actions taken that affect the asset’s content. C2PA supports a list of [pre-defined action](../specs/C2PA_Specification.html.md#_actions) categories that the majority of editing software fall into, such as color adjustments, cropping, or filtering actions in addition to media type specific actions such as those for PDF or Audio.

When presented in a UX to the user, action disclosures should have easy-to-understand labels like:

*   Color adjustments (brightness, tone, filters)
    
*   Compositing (merging, layering)
    
*   Filtered (styles, effects)
    

Granularity of actions is worth considering. In some cases, grouping actions into high level categories may be more understandable for consumers, versus presenting a list of detailed, creation-specific actions that may be unique to the implementation.

Implementers should strike a balance between clarity and information overload based on the intended audience of the implementing platform. For example, C2PA requires the [presence of at least one actions assertion](../specs/C2PA_Specification.html.md#_mandatory_presence_of_at_least_one_actions_assertion) in a standard C2PA Manifest. However, this level of information may be more suitable for an L3 summary, where there is more space for individual manifest details.

<a id="_source_disclosures"></a>
#### 3.3.2. Source Disclosures

Generative AI is changing how content is being produced and consumed. People want to know about the source of the content they are viewing, whether it was generated by an AI tool, created explicitly without generative AI assistance, or taken directly from a camera. These kinds of source disclosures should objectively describe the core processes involved in the creation of an asset.

Source disclosures should be clear and distinct to avoid confusion, particularly when describing whether an asset was fully generated or partially edited using a generative AI tool. For example, the statement, “Made with AI” doesn’t clarify whether the asset is fully or partially generated, and can lead to distrust in the system if, in this example, the creator has only lightly edited small details using generative AI. Likewise, it’s important to avoid making value judgements about whether the usage of generative AI has impacted the meaning of the content. Therefore, source disclosures related to AI-edited or AI-enhanced are discouraged from being included in Content Credentials displays without additional verifiable context of how AI impacted the content.

Since laws may require direct disclosures for generative AI usage, source disclosures could be displayed as part of L1, with additional explanation in L2 or L3 summaries. In a Content Credential with multiple manifests, source disclosures should be clear which ingredients they relate to.

<a id="_regions_of_interest"></a>
#### 3.3.3. Regions of Interest

The display of these actions alone does not necessarily provide enough information about how the content has materially changed. For instance, a cropping action in an image doesn’t relay whether the meaning of the content was changed through that action. By highlighting the [region of interest](../specs/C2PA_Specification.html.md#_regions_of_interest) where the change occurred in the image, or the set of frames in a video, viewers could make more informed decisions about the material change.

Regions of interest can apply to temporal, spatial, or textural changes. In time-based media, time-coded assertions (e.g., actions or ingredients tied to specific frames) can introduce further opportunities for precise visual overlays and interactive timelines. UI patterns like heatmaps can visually track provenance across a video’s timeline.

<a id="_assertions"></a>
### 3.4. Assertions

To build trust in Content Credentials, implementers should distinguish between assertion sources that have been created by the Signer rather than gathered from other sources and included in the signed Manifest. This distinction helps viewers understand which parts of an asset’s provenance are system-verified versus user-declared.

<a id="_created_vs_gathered_assertions"></a>
#### 3.4.1. Created vs. Gathered Assertions

Created assertions typically include things like trusted timestamps, actions performed in a C2PA-aware tool, and ingredient relationships. They may also include device-generated metadata such as GPS coordinates or shutter settings, but only when those assertions are signed by the capture device itself.

Gathered assertions often include IPTC or EXIF metadata imported from the file, manually entered names, captions, or rights information, and user-declared data such as location or organization name that was not signed by the generating device or platform.

However, not all assertions fall neatly into one category. For example, GPS coordinates may be generated by a signed capture device or manually entered after the fact. In these cases, the trustworthiness of the assertion depends not on the data type itself but on who signed it and how it was included in the manifest. The same location metadata might appear in a C2PA metadata assertion when generated by a trusted device, or in a [Creator Assertions Working Group (CAWG)](https://cawg.io/) assertion if manually added and linked to a human identity.

At Levels 2 and 3, implementations should clearly differentiate between created and gathered assertions using contextual labels such as “Recorded by the capture device” or “Entered by the creator.” Avoid presenting them as equivalent, and when possible, provide explanatory context or affordances to help users interpret the trust level of each assertion.

<a id="_custom_assertions"></a>
#### 3.4.2. Custom Assertions

The C2PA specification allows for the inclusion of custom assertions, enabling implementers to record additional metadata that is not covered by the standard assertion types. Custom assertions can support a wide range of use cases, such as [Creator Assertions Working Group (CAWG)](https://cawg.io/) identity information, implementer-specific status codes, non-normative actions, or other proprietary metadata.

While C2PA does not restrict the content of custom assertions, their presence introduces important UX considerations. Because custom assertions are not standardized, their meaning, trustworthiness, and privacy implications must be clearly conveyed to both creators and consumers of Content Credentials. Third-party implementers should exercise caution when deciding whether to display custom assertions from previous Manifest signers. For example, proprietary assertions may be shown with a label that clearly describes its purpose, or excluded from progressive disclosure displays altogether.

<a id="_identity_assertions"></a>
#### 3.4.3. Identity Assertions

Human and organizational identity can be a useful trust signal as part of an asset’s provenance. It helps viewers of C2PA Manifests understand who is responsible for specific actions taken on the asset. While C2PA does not require the identities of individuals or organizations making assertions to be included, the [Creator Assertions Working Group (CAWG)](https://cawg.io/) provides guidance on incorporating verified identity information into manifests. CAWG assertions are considered to be custom assertions within a C2PA manifest, and should follow CAWG UX guidance accordingly.

<a id="_signing_workflows"></a>
### 3.5. Signing Workflows

The moment an asset’s provenance data is signed is a critical inflection point in the trust model. UX patterns should support different signing workflows, including real-time signing, delayed signing, and offline signing. In all cases, it must be clear to creators and viewers alike when signing occurred, who performed it, and whether the asset or assertions were verified at the time of signing.

<a id="_offline_signing"></a>
#### 3.5.1. Offline Signing

In some workflows, creators may sign offline, such as in air-gapped environments or on hardware devices that do not have network access. This type of signing may be delayed, with the signed Content Credentials published to a remote repository only after re-establishing connectivity. Systems that support offline signing should clearly display the trusted timestamp of when signing occurred and include metadata to indicate that the asset was signed in an offline context. While the verification of the signature may occur later, the UI must avoid implying that the signing time and publication time are the same.

Implementers should consider adding a warning to Manifest signatures that don’t contain a trusted time-stamp. These Manifests are still considered valid even without a trusted timestamp, but only for the period of time until the certificate expiry date is reached. At that point, they will become invalid and will require the appropriate validation display.

<a id="_redactions_and_updates"></a>
#### 3.5.2. Redactions and Updates

In some workflows, it may be necessary to redact provenance data from a C2PA Manifest, such as removing a name or location, while leaving the underlying media unchanged. This might be done, for example, to protect a photographer’s privacy before an image is published. In these cases, a redaction is performed, and a separate update manifest must be generated and signed by the implementation making the redaction. This update manifest signals that a change has been made to the C2PA Manifest, not the asset itself, indicating the assertion change and which manifest it applies to.

Both the original manifest from which data was redacted and the update manifest should clearly indicate their status and reference each other. Consistent UX patterns, such as shared language, iconography, and interaction models, are recommended across both. Since update manifests do not involve content changes, they do not include thumbnails or action assertions that might suggest otherwise.

Whether or not redaction details are shown at L2 is left to the discretion of the implementer and use case, but at L3, the additional context, including rationale and linked provenance, should be presented. Update manifests should always include clear pathways to L3 for users seeking more detailed information. It is not recommended to show updates or redactions at L1, as doing so could create confusion.

<a id="_content_credentials_storage"></a>
### 3.6. Content Credentials Storage

There are several ways to bind Content Credentials to assets during the signing process, each of which has direct implications for privacy, persistence, recoverability, and user trust.

Content Credentials can be [embedded locally](../specs/C2PA_Specification.html.md#_embedding_manifests_into_various_file_formats) in the asset, [stored remotely](../specs/C2PA_Specification.html.md#_external_manifests) as cloud data, or a combination of both. These options each have tradeoffs that should be communicated clearly in both creator experiences and potentially L3 displays.

<a id="_embedded_content_credentials"></a>
#### 3.6.1. Embedded Content Credentials

Content Credentials embedded within the asset is likely the most interoperable format as it requires no additional server calls to detect and display provenance information. Creators concerned with data privacy will benefit from embedded Content Credentials, so that only those who have the exported asset can view them. However, embedded data alone is more brittle than the combination of embedding and remotely storing. If the asset’s metadata is stripped, the embedded Content Credentials will be lost forever and unrecoverable.

<a id="_remote_content_credentials"></a>
#### 3.6.2. Remote Content Credentials

Creators who want to maximize data resiliency and recoverability might choose to select to remotely store their Content Credentials. Even if the asset’s metadata is stripped from the file, a remotely stored manifest can persist externally and be recovered through content fingerprinting. An added benefit of remote storage is that the asset’s file size will be smaller than that of an asset with an embedded manifest.

<a id="_watermarks_fingerprinting_and_data_recovery"></a>
### 3.7. Watermarks, Fingerprinting, and Data Recovery

<a id="_watermarks"></a>
#### 3.7.1. Watermarks

An [invisible watermark](../specs/C2PA_Specification.html.md#_invisible_watermark) can be applied to an asset to embed a unique identifier directly within the asset’s digital content. The watermark serves as a [durable](../specs/C2PA_Specification.html.md#_durable_content_credential) reference that enables remote C2PA Manifest recovery when it has been stripped or the file is modified outside a C2PA-enabled workflow. Watermarks may be used across all media types, including images, video, audio, and even scanned or printed materials, to reestablish provenance through soft binding when hard bindings have been lost.

When a creation or editing tool detects a watermark in imported content, users should be notified that provenance data has been recovered. Implementers should indicate that the recovered provenance was matched through a watermark rather than a standard hard binding lookup to help creators understand that recovered Content Credentials will appear among the content’s ingredients. If the content is later signed and a new manifest generated, it will replace the previous watermark reference, restoring the asset to a hard binding state.

If manifest recovery is triggered through a watermark, implementors again should inform users that the manifest, or one or more of its ingredients, was located via watermark-based soft binding rather than a directly embedded manifest. This distinction is most relevant in L3 inspection interfaces, where provenance lineage and recovery methods are explored.

<a id="_fingerprinting"></a>
#### 3.7.2. Fingerprinting

If, instead of a watermark, a validator chooses to use a [content fingerprint](../specs/C2PA_Specification.html.md#_fingerprint) to locate a remote manifest, users should be given control over which recovered manifest they wish to view. To prevent fingerprint recovery from becoming a reverse asset search of remote Content Credentials, matches must be nearly identical to the asset under inspection. When multiple valid matches exist, results should be ordered chronologically, prioritizing the earliest known provenance or the most recently active manifest.

<a id="_recovery"></a>
#### 3.7.3. Recovery

Both watermarking and fingerprinting support durable provenance recovery, and both techniques should be implemented consistently across media formats. Watermarks provide the benefit of embedded persistence without requiring a separate fingerprinting system, while fingerprinting can support additional recovery for video, audio, or other continuous media. Together, these mechanisms strengthen the durability of Content Credentials and ensure that provenance can be reconnected even in complex or degraded workflows.

<a id="_creator_experience"></a>
### 3.8. Creator Experience

<a id="_user_consent"></a>
#### 3.8.1. User Consent

Implementers must always allow their users to opt into Content Credentials features that record personally identifiable information. This consent process should be clear and comprehensive. Creators should receive upfront disclosures about what data will be recorded and how it will be displayed. A preview interface can visually summarize what will be shown to end users, including which assertions are required and which are optional. For example, ingredient manifests may be mandatory for provenance integrity, while disclosing identity or specific edits may be optional. Provide clearly labeled toggles or consent checkboxes that allow creators to adjust these settings at any time. Opt-out flows should be just as accessible and understandable as opt-ins, especially in workflows involving sensitive or experimental content.

<a id="_assertion_settings"></a>
#### 3.8.2. Assertion Settings

Creators should be empowered to tailor the information contained in their Content Credentials to match their intent, audience, and privacy preferences. This includes choosing which optional assertions are included, such as recorded editing history or other attribution information. Manifest settings should be thoughtful, educational, and supportive of nuanced use cases.

The [Creator Assertions Working Group (CAWG)](https://cawg.io/) identity assertion allows content creators to connect themselves to their work and take responsibility for other assertions. This should be used by content creators to assert responsibility for human-generated metadata expressed in a CAWG metadata assertion. Creation tools should make this relationship clear and encourage content creators to opt into such assertions, where possible.

<a id="_action_disclosure"></a>
#### 3.8.3. Action Disclosure

Actions are a type of assertion detailing what was done to the content during its lifecycle. While some fields may be automatically recorded (e.g., timestamp or tool used), creators should have the ability to opt in or out of recorded editing history.

Some creators may want to reserve the right to not disclose the actions they’ve taken on a given piece of content. The exception to this is the generative AI source disclosure. The implementer should determine when the need for AI transparency supersedes creator preferences.

Creators should be warned that omitting actions may impact audience trust, especially in journalism, documentation, or scientific contexts. For more artistic or personal workflows, minimal or abstract action reporting may be preferable. Strike a balance between clarity and control.

<a id="_ingredient_validation"></a>
#### 3.8.4. Ingredient Validation

Creators who incorporate other assets (e.g., stock photography, graphics, or collaborative contributions) need to be aware of the presence of these ingredients in their Content Credentials. Ingredient manifests must be included where possible and clearly labeled in previews. UI recommendations include:

*   Ingredient thumbnails or icons
    
*   Hover states, badges, or modals displaying errors related to the ingredient’s valid, well-formed, or trusted states
    
*   Alerts or badges for risky or unverifiable content
    

By surfacing this information during the creation or editing process, creators can make informed decisions about content sourcing, editing, and reuse.

<a id="_output_pathways"></a>
#### 3.8.5. Output Pathways

Within an interactive application, Export and Save As functions are opportunities to reinforce creator control. When a user finishes a creative session or completes a project, they should be prompted to finalize the provenance package:

*   Review a manifest preview
    
*   Toggle visibility for optional assertions
    
*   Confirm or modify identity details
    
*   Decide if and how to attach the provenance to the final asset
    

C2PA recommends making this process non-intrusive and in line with the application’s existing flows. For example, include a Content Credentials section in a Save dialog. This ensures creators retain ownership over how and when their content is associated with provenance data. For non-interactive applications, such as API calls, implementers should include accessible documentation about the assertions that will be signed into the manifest when initiated.

Creators should be given clear guidance about where their Content Credentials are stored (eg. embedded in the asset, stored remotely, or both). Storage location has direct implications for privacy, persistence, recoverability, and user trust, and these tradeoffs should be communicated clearly. Privacy-minded creators may choose to embed their Content Credentials in the asset directly, so that only those who have the exported asset can view its Content Credentials. Creators who want to keep their file sizes smaller and maximize data resiliency and recoverability might choose to select a cloud storage option. It should be noted that durable features like invisible watermarks and content fingerprinting require access to remotely stored manifests.

<a id="_time_based_media"></a>
### 3.9. Time-Based Media

Time-based media like video and audio require unique handling. In particular, the temporal nature of video introduces complexity due to the layered structure of mixed-media ingredients, edits, and contributors, which may span multiple sessions and applications.

<a id="_video_delivery_methods"></a>
#### 3.9.1. Video Delivery Methods

There are two predominant ways video is delivered to devices over the web, these include:

1.  Dynamic video streaming (typically done via MPEG-DASH or HLS) where small video segments (also referred to as packets) are sent progressively to the browser. This allows for adaptive bitrate streaming, where the quality of the video can change on the fly depending on the viewer’s network conditions.
    
2.  As one single file (monolithic architecture), where all aspects of the video are managed in a single tightly integrated system. This approach is less flexible and therefore rarer.
    

For both approaches, the manifest can be validated on load and subsequently valid provenance data can be displayed. However, dynamic video streaming requires that each segment is validated as it’s rendered. While the full video’s validation status can’t be reported, the status of individual segments can. While each segment can be validated, video streams inherently have different bitrates, opening up the possibility for the same segment to show conflicting validation statuses depending on the bitrate being played at the time. As soon as a segment is requested by the player, whether it is the first or multiple times afterwards, it’s validated. The UI should communicate that validation is conducted per viewing instance, not per video.

<a id="_loading"></a>
#### 3.9.2. Loading

Manifest validation occurs quickly on page load, so any manifest validation errors should be surfaced to the user immediately. Implementers should take into account how videos load, as that may impact the display of the manifest’s validation status.

**Lazy loading:** Video players set to lazy load defer the loading of resources until they are needed, improving initial page load time and reducing bandwidth usage. Although user interaction is required for the asset validation process to initiate, valid manifest data can be shown with the caveat that the content has not yet been validated against this information.

**Preloading:** Video players fetch video resources ahead of time to eliminate waiting periods. In this scenario, the initial segment or some segments may be downloaded before the user interacts with the player. Valid manifest data can be shown and the validation status of these initial segments may be communicated confidently.

**Autoplay:** As this doesn’t require user interaction to initiate playback, the validation process can commence in parallel. Valid manifest data can be shown and the validation status of the rendered segments may be communicated confidently and progressively inline with playback.

<a id="_validation_during_streaming"></a>
#### 3.9.3. Validation During Streaming

The validation process is dependent on the video download speed. Video streaming involves progressively downloading and compiling small video chunks of the full video as one continuous stream. It is at this point that each segment is validated and their statuses can be communicated.

Video players allow users to easily move back and forth to specific moments in the video. When parts of the video are skipped, these sections may not be validated, which can lead to uncertainty about their accuracy or validity. However, it is not recommended to attempt to communicate this uncertainty as it may create confusion to the user. What has not been viewed should be left as unknown.

When a user adjusts the video quality (e.g., changes the bitrate), the new segments will be revalidated.

<a id="_display_considerations"></a>
#### 3.9.4. Display Considerations

L1 indicators for time-based media should remain visible but unobtrusive—overlays should fade or shrink during playback, or appear on pause or hover. Placement within the media player helps signal its persistent connection to the content without obstructing the viewing experience.

L2 displays should prioritize simplicity and focus on the most essential information, whereas within L3, time-based media Content Credentials can be treated relatively similarly to static media. Given consideration to the visual representation for video and audio manifests. For video, an ingredient manifest can be represented as a thumbnail derived from the poster attribute or the first frame of the video, or could be as simple as a filmstrip icon. Given the volume of potential mixed-media files used in a given video asset, ingredient manifests should generally not be listed unless they are few and easy to interpret. If multiple manifests exist, consider grouping them into expandable sections with numeric indicators.

For platform continuity, ensure Content Credential displays are responsive and respect platform-specific interaction modes (e.g., keyboard shortcuts on desktop, gestures on mobile).

<a id="_components"></a>
## 4\. Components

<a id="_content_credentials_icon"></a>
### 4.1. Content Credentials Icon

![Content Credentials icon](_images/2-2_cr.jpg)

Figure 1. Content Credentials icon

The icon, whose trademark is owned by C2PA, takes the shape of a pin, a metaphorical representation for applying (or “pinning”) Content Credentials to an asset. It is also intended as a navigation element to reveal more C2PA information. Its proximity to other international attribution symbols, like copyright and Creative Commons, imbues the icon with a level of trust and authority.

The design of the Content Credentials icon has been carefully considered and should not be altered or modified in any way. Unacceptable modifications include adding a solid interior fill, drop shadow, or applying other graphic alterations to the icon. Avoid using an outline-only pin on patterned background or images. Do not add a valid status, as the icon alone should already indicate the presence of a valid manifest. When adding a secondary mark for cryptographic validation, avoid placing the status indicator over the characters, or using other icons that do not convey cryptographic status.

<a id="_l1_indicators"></a>
### 4.2. L1 Indicators

L1 is the user’s first signal that provenance exists. Ideally, this signal is instantly recognizable and accessible. The C2PA recommends the Content Credentials icon as the default visual display, but does not require it to be the L1 indicator. An implementer may consider other relevant icons that can convey additional context about a specific asset, such as help or information iconography, menu icons, or learn more links.

Within a given application, the L1 indicator should appear in a consistent position (e.g., as an asset hover overlay; in the top corner of a social media post) and maintain high contrast. To avoid spoofing, do not directly overlay the indicator on top of content or embed it directly into the pixel content.

When L1 is used in videos or interactive content, ensure it doesn’t obstruct playback controls or critical content.

If there are additional trust signals presented alongside Content Credentials information, such as other metadata collected or generated by the platform, ensure that it is clear what information is specific to Content Credentials. Either the label “Content Credentials” or the icon can be used here to denote the specific signed C2PA Manifest information.

<a id="_l1_source_disclosures"></a>
### 4.3. L1 Source Disclosures

Some platforms may require source disclosures to be immediately visible to their viewers. These statements can be included as part of the L1 indicator, and could take the form of iconography, strings, or a combination.

When labeling content, consideration must be given to the implied truth effect. For example, if some assets are labeled with a generative AI disclosure, viewers may believe that unlabeled content is more likely to be real.

Implementers should consider the way in which L1 indicators are introduced across their platform to prime their users to understand how to identify an L1 indicator and interpret the corresponding provenance information.

<a id="_l2_and_l3_summaries"></a>
### 4.4. L2 and L3 Summaries

Manifest summaries are a curated collection of assertions across the entire provenance of an asset. These are best suited for L2 and L3, and should be optimized to show the most relevant assertions, such as:

*   Signer (e.g., EditorSuite) and optional logo for brand recognition
    
*   Trusted timestamp, if present
    
*   Source disclosures, if applicable
    
*   Identity information, if applicable
    

Previous implementations have shown summaries of active manifest assertions only. However, implementers should consider summarizing key assertions across the entire provenance to avoid inadvertently hiding important information about how content has been edited, or if there are errors that occurred earlier in the asset’s provenance history.

Summary layouts should balance information richness with spatial efficiency. Viewers prefer a quick and digestible format for consuming Content Credentials information, so consideration should be given to presenting assertions in a list format or as a short summary paragraph.

For complex manifest histories, wherein there are multiple ingredients, consider providing optional summaries for each individual manifest. User interfaces like tree structures or nested menus can be helpful for accessing individual manifest summaries.

<a id="_validation_states"></a>
### 4.5. Validation States

Visual states are critical to helping users interpret the reliability of data. There are several different [C2PA Manifest validation states](../specs/C2PA_Specification.html.md#_validation_states) that implementers should consider communicating. A C2PA Manifest may be one of the following:

*   Valid: The manifest is well-formed and the signature is valid.
    
*   Well-formed: Hard bindings are intact and all assertions and ingredients abide by normative C2PA requirements.
    
*   Trusted: The C2PA Manifest is valid, and the signer is found on a supported Trust List.
    

When a C2PA Manifest meets one of these criteria, no additional positive affordance is needed to communicate its status across the progressive disclosures. However, when a manifest fails to meet one or more of these states, implementers must communicate the impact to the manifest’s reliability.

<a id="_well_formed_and_valid_but_not_trusted"></a>
#### 4.5.1. Well-Formed and Valid, But Not Trusted

A manifest that is well-formed with a valid signature may have been signed by a signer from a Trust List unsupported by the implementer. Instead of hiding an otherwise valid manifest, implementers should consider adding a warning to their direct disclosures that explain the issue. For example, “The identity of the signer can’t be verified” communicates that the viewer should proceed with caution when viewing provenance information from the affected Content Credentials.

Secondary badges or icons like a yellow warning or red alert can support a visible validation state at the L1 level or across the manifest chain wherever individual affected manifests may appear.

<a id="_well_formed_but_not_valid_or_trusted"></a>
#### 4.5.2. Well-Formed, But Not Valid or Trusted

An issue with the signer’s claim signature invalidates a well-formed manifest’s status, which in turn invalidates its trusted status. This could be a result of an expired certificate or an invalid claim signature validity period. These errors should be messaged accordingly across the direct disclosures.

A more common reason could be that uncaptured changes were made to an asset that had valid Content Credentials. This would invalidate the signature and trust status, but is likely to occur frequently until there is significant adoption of Content Credentials support across platforms. Consider the following example: a photo is signed on a C2PA-supported camera, but is lightly edited in an unsupported photo editing tool. An L3 UI might opt to still display the camera’s original Content Credentials, but with a warning such as, "These Content Credentials contain incomplete provenance.” This approach allows the viewer to see the original, valid Content Credentials but with the context that the asset contains an undocumented change.

These kinds of errors should be represented at the L1 level and in the L2 and L3 summary views so as not to obfuscate any potential loss of provenance information. If errors occurred earlier in the asset’s provenance, viewers should have a way to know which manifests were impacted and which manifests are still considered valid.

<a id="_not_well_formed_valid_or_trusted"></a>
#### 4.5.3. Not Well-Formed, Valid or Trusted

C2PA recommends hiding not-well-formed manifests from end viewers altogether, or including a message such as, “There is a problem with this asset’s Content Credentials and they can’t be viewed.” Potential causes for this may be that the manifest has been tampered with, or its hard bindings have failed validation.

Once again, these errors should be represented across all direct disclosure levels and made clear to end viewers where within the asset’s provenance history they exist.

<a id="_open_issues"></a>
## 5\. Open Issues

<a id="_user_research"></a>
### 5.1. User Research

Correctly identifying and displaying trust signals is of paramount concern for our overall user experience. C2PA strives to understand the value consumers will apply to content provenance through ongoing user research studies and usability testing.

<a id="_applications_use_cases_and_additional_media_formats"></a>
### 5.2. Applications, Use Cases, and Additional Media Formats

Pending user research, C2PA will provide implementors with recommended L2 customizations based on combinations of content, audiences, and platforms. Examples may include news publishers, social sites, e-commerce and retail, travel, and entertainment platforms. The recommendations for video UX will also continue to expand in scope and complexity, along with the introduction of other media formats like audio and streaming content.

<a id="_public_review_feedback_and_evolution"></a>
## 6\. Public Review, Feedback and Evolution

The team authoring the UX recommendations is cognizant of its limitations and potential biases, recognizing that feedback, review, user testing and ongoing evolution is a requirement for success. This guidance is therefore an evolving document, informed by real world experiences deploying C2PA UX across a wide variety of applications and scenarios.

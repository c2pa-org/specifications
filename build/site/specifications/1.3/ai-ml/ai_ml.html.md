# Guidance for Artificial Intelligence and Machine Learning

[![Creative Commons License](_images/CCby4.png)](https://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

<a id="_introduction"></a>
## 1\. Introduction

The [C2PA specification](../../1.1/specs/C2PA_Specification.html.md) can be used to add cryptographic information to detect the tampering of media files and streams. Similarly, the C2PA framework can also be used in artificial intelligence (AI) and machine learning (ML) systems to indicate the tampering of datasets, software, and models which are utilized during training and inference. This document provides guidance about how C2PA can be employed by AI and ML systems.

Recent research has demonstrated that ML systems are susceptible to different forms of poisoning attacks. For these types of attacks, the goal of the adversary is to cause the model to make incorrect predictions which can either be targeted or non-targeted attacks. In targeted attacks, a classifier can be maliciously trained to provide a backdoor that can be exploited by the attacker to produce a specific incorrect prediction class. One example of a targeted attack is to modify a face recognition system to allow the adversary to successfully log onto a computer as someone else. A model that has been poisoned using an untargeted attack may generate any result that is incorrect. At a minimum, the ML system must protect against three types of poisoning attacks including data poisoning, software poisoning, and model poisoning attacks [\[Stokes21\]](#Stokes21). C2PA can be used to help prevent these types of attacks by protecting the data, software, and models.

<a id="_data_poisoning_attacks"></a>
## 2\. Data Poisoning Attacks

Data poisoning attacks are designed to corrupt the data used to train machine learning models. This can be done by adding malicious data to the training set or by modifying existing training data. During inference, the data that is input to the model for prediction can also be poisoned leading to an incorrect prediction.

Many of the existing training sets are stored in a single file, and these files can be protected by a single C2PA Content Credential. The dataset’s hash, which is stored in the Content Credential, can be used to verify that it has not been modified by a data poisoning attack.

In other settings, the training and inference data may be split across multiple files, including media files such as images which are used to train an object detection model. In addition, the training or inference data may be streamed. In these scenarios, the data may be protected by a top-level C2PA Content Credential which includes each of the files as ingredients. In the case where the ingredients are media files, they may contain their own Content Credentials.

In images and videos, a C2PA Content Credential can be [embedded](../../1.1/specs/C2PA_Specification.html.md#_embedding_manifests_into_assets) in the media file. However, existing machine learning datasets are either text or binary files which prevents the embedding of a Credential in the file. In these cases, the Content Credential can be stored in a separate, sidecar file. The Content Credential can then use the Asset Reference Assertion to provide a URI to the dataset file or streamed data chunk.

<a id="_software_poisoning_attacks"></a>
## 3\. Software Poisoning Attacks

Software poisoning attacks are designed to maliciously modify the software used to train a machine learning model or use a model to make a prediction. This can be done by modifying the training and inference software or any additional packages or libraries that are used during training and inference.

Many countries are concerned with software poisoning attacks and have taken steps to help mitigate such attacks. The European Union Cybersecurity Act 2019/881 specified a framework for certificates in [\[EU19\]](#EU19). To help prevent software supply chain attacks, the US Cybersecurity Executive Order [\[Biden21\]](#Biden21) requires that all software or services purchased by the US federal government be governed by a software bill of materials (SBOM). [SPDX](https://spdx.dev/specifications/) is one popular standard which is used by some software vendors to provide an SBOM. C2PA utilizes and builds upon the existing SBOM metadata standards for software. One or more SPDX text files provide metadata about the software used to build an application, library or service. Each software file and its corresponding SPDX file can then be protected by a C2PA Content Credential.

In some cases, C2PA can improve existing SBOM standards. In one example, SPDX files in the current standard (v2.3) are not signed and its contents, including the FileChecksum, can be modified by an attacker. C2PA can be used to sign the SPDX file to prevent tampering.

<a id="_model_poisoning_attacks"></a>
## 4\. Model Poisoning Attacks

Once a model has been trained with C2PA-protected data and software, it can then be used to make secure predictions during inference. However, the model can still be poisoned by modifying its architecture or parameters. To help prevent model poisoning attacks, a C2PA Content Credential can be used to protect the model by providing a signature which can be verified by the user.

<a id="_other_model_attacks"></a>
## 5\. Other Model Attacks

Malicious data inserted for prediction can also be used to invert or extract the model. Data with a validated C2PA signature traceable to the sensing device provides assurance that the input data is not engaging in these oracle attacks.

There are also non-poisoning trojan attacks which are aimed at the model and do not change the model’s accuracy significantly. These types of attacks insert a malicious payload in low importance layers (or add additional fake layers). C2PA’s trust model (i.e., signatures) helps protect against these post-signature modifications as well.

<a id="_compressed_files"></a>
## 6\. Compressed Files

In many cases, large datasets are compressed to reduce storage costs. For example, the original MNIST data is compressed using gzip. The Manifest of the final, uncompressed file can include the compressed dataset file as an ingredient. In the case of lossless compression algorithms, this will allow the user to ensure that the uncompressed file was derived from a trusted compressed asset.

<a id="_ai_ml_model_content_credential"></a>
## 7\. AI-ML Model Content Credential

The C2PA Content Credential for an AI-ML model provides the consumer, e.g. a system operator designing an AI-ML system, with provenance and authenticity of the model. When the model is included as an ingredient in the Content Credential of the output of an AI-ML system, the consumer of the output can check the validation state of the model and explore the model provenance to provide additional assurance that the output is trustworthy. See more about this in the [AI-ML Output Content Credential](#_ai-ml_output_content_credential) section.

AI-ML output results have a wide range of concerns and risks depending on how the models were prepared and how the consumer uses the output. Accordingly, the AI-ML provenance information is explored in levels of depth, reflecting the consumers need to reduce risk by establishing deeper trust in the results. Briefly these levels describe the model itself, the training data used to create the model, and finally additional information about the training of the model, the training environment, and various extensions that relate explainability, transparency, and indicators of trust for the model.

If the model provider does not want the model and its output to be used to train other models in an attempt to extract the model’s functionality, the model Content Credential can contain a data mining assertion that asserts rights as allowed, constrained, or not allowed for generative or non-generative AI-ML models or both. See [data mining](../../1.1/specs/C2PA_Specification.html.md#<em>training_and_data_mining</em>) for more detail.

![Visual diagram of the elements contained in a model Content Credential](_images/Model-Manifest-v1.3.svg)

The most basic provenance information allows the consumer to understand what type of model is being used, authenticate the claim signature, and to verify that the model had not been tampered with.

An [asset type assertion](../../1.1/specs/C2PA_Specification.html.md#_asset_type) provides the basic model information that a validator would use to further validate the model. By including the model’s name, machine learning framework, and the type, the consumer is better able to understand what the model does and how it does it.

An example of an asset type assertion for an OpenVINO model, in CBOR Diagnostic Format (`.cbordiag`) would be:

```json
/ Asset Type (OpenVINO Model) /
{ 
	"types": [
		{
			"type": "c2pa.types.model.openvino",
			"version": "2.11.0"
		}
	]
}
```

The [asset reference assertion](../../1.1/specs/C2PA_Specification.html.md#_asset_reference) provides a URI to the data of the asset, such as a AI-ML model. This assertion is accompanied by a data hash that provides a hard binding to the asset (e.g., a model file) enabling the validator to confirm its integrity.

OpenVINO represents the model in two files, included as ingredients. An XML file contains the topology:

```json
/ Ingredient-1: Everything related to an OpenVINO Model TOPOLOGY FILE /
{ 
  "dc:title": "brain-tumor-segmentation-0001",
  "dc:format": "application/octet-stream",
  "relationship": "componentOf",
  "documentID" : "uuid:87d51599-286e-43b2-9478-88c79f49c347",
  "instanceID" : "uuid:7b57930e-2f23-47fc-affe-0400d70b738d",
  "data":
    { / hashed-ext-uri-map: Link to asset location (online) and asset hash /
        "url": "https://storage.openvinotoolkit.org/repositories/open_model_zoo/public/2022.1/brain-tumor-segmentation-0001/brain-tumor-segmentation-0001-0000.bin",
        "alg": "sha256",
        "hash": b64'Auxjtmax46cC2N3Y9aFmBO9Jfay8LEwJWzBUtZ0sUM8gA=',
        "data_types": [ "c2pa.types.model.openvino.topology" ]
    }
}
```

And the parameters are in a BIN file:

```json
/ Ingredient-2: Everything related to an OpenVINO Model PARAMETER FILE /
{ 
  "dc:title": "brain-tumor-segmentation-0001",
  "dc:format": "text/xml",
  "relationship": "componentOf",
  "documentID" : "uuid:87d51599-286e-43b2-9478-88c79f49c347",
  "instanceID" : "uuid:7b57930e-2f23-47fc-affe-0400d70b738d",
  "data":
    {  / hashed-ext-uri-map: Link to asset location (online) and asset hash /
        "url": "https://storage.openvinotoolkit.org/repositories/open_model_zoo/public/2022.1/brain-tumor-segmentation-0001/brain-tumor-segmentation-0001-0000.params",
        "alg": "sha256",
        "hash": b64'Auxjtmax46cC2N3Y9aFmBO9Jfay8LEwJWzBUtZ0sUM8gA=',
        "data_types": [ "c2pa.types.model.openvino.parameter" ]
    }
}
```

It is also possible for a C2PA Content Credential to include information about the data used to train an AI-ML model, by including ingredient assertions which can include the URI and a hard binding, which can be used to check its integrity and authenticity. Here is an example of a training data ingredient in a model Content Credential:

```json
/ Ingredient-3: Everything related to an OpenVINO Model TRAINING DATASET /
{
  "dc:title": "brain-tumor-segmentation-0001",
  "dc:format": "application/octet-stream",
  "relationship": "componentOf",
  "documentID" : "uuid:87d51599-286e-43b2-9478-88c79f49c347",
  "instanceID" : "uuid:7b57930e-2f23-47fc-affe-0400d70b738d",
  "data":
    { / hashed-ext-uri-map: Link to asset location (online) and asset hash /
        "url": "https://storage.openvinotoolkit.org/repositories/open_model_zoo/public/2022.1/brain-tumor-segmentation-0001/brain-tumor-segmentation-0001-0000.dataset.zip",
        "alg": "sha256",
        "hash": b64'Auxjtmax46cC2N3Y9aFmBO9Jfay8LEwJWzBUtZ0sUM8gA=',
        "data_types": [ "c2pa.types.dataset.openvino" ]
    }
}
```

> **NOTE:**
> Future Guidance for a Model Content Credential
>
> For consumers who need to mitigate high risk, and for providers that want to enable the highest level of trust in their models, extensive provenance in an AI-ML Content Credential enables both objectives. A number of machine learning development frameworks are working on 'model cards' that provide a structure for model metadata that enhances transparency and trustworthiness. These model cards may be linked as an ingredient for the model. The trustworthiness of an AI-ML model is not only a function of the training data, but also of the tools used for data set preparation and training, how the hyper-parameters were set, the security of the environment the model was trained in, explanations about the output, and more. All of this information can be added to a model Content Credential for the consumers to build trust in the training process itself which augments their trust in the claim.

<a id="_attestation_for_ai_ml_models"></a>
### 7.1. Attestation for AI-ML Models

Model providers can enhance the trust signals so relying parties can determine the software and characteristics of the devices used to create the model asset. This is done by including an xrefL1.4@specs:C2PA\_Specification.adoc#\_attestation\[attestation assertion\] in the model Content Credential. Please refer to the [attestation technical specification](<attestation.adoc>) for the description of the process for creating claims with attestations.

<a id="_ai_ml_output_content_credential"></a>
## 8\. AI-ML Output Content Credential

For a consumer to validate the output data produced by an AI-ML model, again, different amounts of information are needed for different risk sensitivities. The basic signed claim enables the consumer to validate the source and integrity of the results. It is important to identify the output as coming from a trained AI-ML model by using the appropriate digital source type. For a generative model this will be `trainedAlgorithmicMedia` and for output that is not media the `c2pa.trainedAlgorithmicData` designation would be appropriate. Given the growing consumer risk sensitivity from AI-ML output data, providing information in the output Content Credential beyond the basic claim and data hash is recommended. Additional Material in the assertion store such as links to the AI-ML model Content Credential, provenance of the inputs to the model, the components and security of the environment the model ran in, timestamps, and even explainability metadata that tell the consumer why the model provided the result it provided all can enable more trust in the results.

In addition the AI-ML output may contain the prompt used for the input to a generative AI model, and the results may also have a training and data mining assertion that asserts right to use the output.

<a id="_references"></a>
## References

*   \[Stokes21\] J. W. Stokes, P. England and K. Kane, "Preventing Machine Learning Poisoning Attacks Using Authentication and Provenance," MILCOM 2021 - 2021 IEEE Military Communications Conference (MILCOM), 2021, pp. 181-188.
    
*   \[EU19\] [https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32019R0881](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32019R0881)
    
*   \[Biden21\] [https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/).

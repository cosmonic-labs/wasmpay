package types

type ConversationRole string

const (
	ConversationRoleUser      ConversationRole = "user"
	ConversationRoleAssistant ConversationRole = "assistant"
)

type ContentBlock interface {
	isContentBlock()
}

// Text to include in the message.
type ContentBlockMemberText struct {
	Value string `json:"text"`
}

func (*ContentBlockMemberText) isContentBlock() {}

type ConverseOutput interface {
	isConverseOutput()
}

// The message that the model generates.
type ConverseOutputMemberMessage struct {
	Value Message
}

func (*ConverseOutputMemberMessage) isConverseOutput() {}

// https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types#InferenceConfiguration
type InferenceConfiguration struct {
	// The maximum number of tokens to allow in the generated response. The default
	// value is the maximum allowed value for the model that you are using. For more
	// information, see [Inference parameters for foundation models].
	//
	// [Inference parameters for foundation models]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
	MaxTokens *int `json:"max_tokens,omitempty"`

	// A list of stop sequences. A stop sequence is a sequence of characters that
	// causes the model to stop generating the response.
	StopSequences []string `json:"stop_sequences,omitempty"`

	// The likelihood of the model selecting higher-probability options while
	// generating a response. A lower value makes the model more likely to choose
	// higher-probability options, while a higher value makes the model more likely to
	// choose lower-probability options.
	//
	// The default value is the default value for the model that you are using. For
	// more information, see [Inference parameters for foundation models].
	//
	// [Inference parameters for foundation models]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
	Temperature *float32 `json:"temperature,omitempty"`

	// The percentage of most-likely candidates that the model considers for the next
	// token. For example, if you choose a value of 0.8 for topP , the model selects
	// from the top 80% of the probability distribution of tokens that could be next in
	// the sequence.
	//
	// The default value is the default value for the model that you are using. For
	// more information, see [Inference parameters for foundation models].
	//
	// [Inference parameters for foundation models]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
	TopP *float32 `json:"top_p,omitempty"`
}

// https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types#Message
type Message struct {
	// The message content.
	Content []ContentBlock `json:"content"`

	// The role that the message plays in the message.
	Role ConversationRole `json:"role"`
}

// https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types#SystemContentBlock
type SystemContentBlock interface {
	isSystemContentBlock()
}

// A system prompt for the model.
type SystemContentBlockMemberText struct {
	Value string `json:"text"`
}

func (*SystemContentBlockMemberText) isSystemContentBlock() {}

mod generated {
    wit_bindgen::generate!({
        generate_all,
        additional_derives: [serde::Serialize, serde::Deserialize, Default],
    });

    pub struct Component;
    export!(Component);
}

use generated::exports::wasmcloud::messaging::handler::Guest as MessagingHandler;
use generated::wasmcloud::messaging::types::BrokerMessage as IncomingMessage;
use generated::wasmpay::platform::validation::validate;
use generated::Component;

use wasmcloud_component::wasmcloud::messaging::consumer::{publish, BrokerMessage};
use wasmcloud_component::{debug, info, warn};

impl MessagingHandler for Component {
    fn handle_message(msg: IncomingMessage) -> Result<(), String> {
        // If the message has a reply subject, we'll validate the transaction
        if let Some(subject) = msg.reply_to {
            debug!("received request to validate transaction");
            let response = if let Ok(transaction) = serde_json::from_slice(&msg.body) {
                info!("Validating transaction: {transaction:?}");
                let res = validate(&transaction);
                BrokerMessage {
                    subject,
                    body: format!("Transaction should be approved {res}").into_bytes(),
                    reply_to: None,
                }
            } else {
                BrokerMessage {
                    subject,
                    body: "Invalid transaction".to_string().into_bytes(),
                    reply_to: None,
                }
            };
            publish(&response)
        } else {
            warn!("Message received without a reply subject, noop");
            Err("No reply subject, not validating transaction".to_string())
        }
    }
}

mod generated {
    use super::Component;

    wit_bindgen::generate!({
        world: "validator-harness",
        path: "../wit",
        generate_all,
        additional_derives: [serde::Serialize, serde::Deserialize],
    });

    export!(Component);
    wasmcloud_component::http::export!(Component);
}

use generated::exports::wasmcloud::messaging::handler::BrokerMessage as IncomingMessage;
use generated::exports::wasmcloud::messaging::handler::Guest as MessagingHandler;
use generated::exports::wasmpay::platform::validation::Guest as ValidationHandler;
use generated::wasmpay;

use wasmcloud_component::wasmcloud::messaging::consumer::{publish, BrokerMessage};
use wasmcloud_component::{debug, http, info, warn};

struct Component;

/// Implements the `wasi:http` export for the validator
impl http::Server for Component {
    fn handle(
        request: http::IncomingRequest,
    ) -> http::Result<http::Response<impl http::OutgoingBody>> {
        let (_parts, body) = request.into_parts();
        if let Ok(transaction) = serde_json::from_reader(body) {
            info!("Validating transaction: {transaction:?}");
            let res = <Component as ValidationHandler>::validate(transaction);
            Ok(http::Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(format!(
                    r#"{{"approved": {}, "reason": "{}"}}"#,
                    res.approved,
                    res.reason.unwrap_or_else(|| "None".to_string())
                ))
                .unwrap())
        } else {
            warn!("Invalid transaction");
            return Ok(http::Response::builder()
                .status(400)
                .body(r#"{{"approved": false, "reason": "Invalid transaction"}}"#.to_string())
                .unwrap());
        }
    }
}

/// Implements the `wasmcloud:messaging` export for the validator
impl MessagingHandler for Component {
    fn handle_message(msg: IncomingMessage) -> Result<(), String> {
        // If the message has a reply subject, we'll validate the transaction
        if let Some(subject) = msg.reply_to {
            debug!("received request to validate transaction");
            let response = if let Ok(transaction) = serde_json::from_slice(&msg.body) {
                info!("Validating transaction: {transaction:?}");
                let res = <Component as ValidationHandler>::validate(transaction);
                BrokerMessage {
                    subject,
                    body: format!(
                        "Transaction approved: {}. Reason: {}",
                        res.approved,
                        res.reason.unwrap_or_else(|| "None".to_string())
                    )
                    .into_bytes(),
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

/// Component passthrough to call the composed component's validation function
impl ValidationHandler for Component {
    fn validate(
        transaction: wasmpay::platform::types::Transaction,
    ) -> wasmpay::platform::types::ValidateResponse {
        // Additional validation logic can be added here
        debug!("Validating transaction in platform harness {transaction:?}");
        wasmpay::platform::validation::validate(&transaction)
    }
}

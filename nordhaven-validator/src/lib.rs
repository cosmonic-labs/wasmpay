mod wasmpay {
    use super::Component;
    wit_bindgen::generate!({
        world: "validator",
        path: "../wit",
        generate_all
    });

    pub use exports::wasmpay::*;
    export!(Component);
}

use wasmpay::platform::validation::*;

struct Component;

impl Guest for Component {
    fn validate(transaction: Transaction) -> ValidateResponse {
        wasmcloud_component::info!("Validating transaction {transaction:?}");
        if transaction.currency == "USD" {
            ValidateResponse {
                approved: true,
                reason: None,
            }
        } else {
            wasmcloud_component::warn!("Unsupported currency: {}", transaction.currency);
            ValidateResponse {
                approved: false,
                reason: Some(format!("Unsupported currency: {}", transaction.currency)),
            }
        }
    }
}

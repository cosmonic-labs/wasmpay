mod wasmpay {
    wit_bindgen::generate!({
        generate_all,
        additional_derives: [serde::Serialize, serde::Deserialize, Default],
    });

    pub struct Component;
    pub use exports::wasmpay::*;
    export!(Component);
}

use wasmpay::platform::validation::*;
use wasmpay::Component;

impl Guest for Component {
    fn validate(transaction: Transaction) -> bool {
        wasmcloud_component::info!("Validating transaction {transaction:?}");
        if transaction.currency == "CAD" {
            true
        } else {
            wasmcloud_component::warn!("Unknown currency {}", transaction.currency);
            false
        }
    }
}

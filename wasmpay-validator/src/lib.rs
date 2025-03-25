mod wasmpay {
    use super::Component;
    wit_bindgen::generate!({
        world: "validator",
        path: "../wit",
        generate_all,
    });

    pub use exports::wasmpay::*;
    export!(Component);
}

use wasmpay::platform::validation::*;

struct Component;

impl Guest for Component {
    fn validate(transaction: Transaction) -> bool {
        wasmcloud_component::debug!("Validating transaction {transaction:?}");
        // TODO: basic validation
        true
    }
}

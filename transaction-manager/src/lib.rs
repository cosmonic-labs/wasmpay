mod wasmpay {
    use super::TransactionManager;
    wit_bindgen::generate!({
        world: "transaction-manager",
        path: "../wit",
        generate_all,
    });

    pub use exports::wasmpay::platform::validation::Guest;
    export!(TransactionManager);
}

use wasmcloud_component::wasmcloud::bus::lattice;
use wasmcloud_component::{debug, error, info};
use wasmpay::wasmpay::platform::types::Transaction;
use wasmpay::wasmpay::platform::validation::validate;
use wasmpay::Guest;

const WASMPAY_PLATFORM: &str = "wasmpay_platform";

pub struct TransactionManager;
impl Guest for TransactionManager {
    fn validate(transaction: Transaction) -> bool {
        wasmcloud_component::info!("Validating transaction {transaction:?}");

        // Run wasmpay validation
        // THOUGHTS: We can live update this component to change validation rules
        // without having to update the transaction-manager component.
        if let Err(e) = validate_with(&transaction, WASMPAY_PLATFORM) {
            error!("Validation failed for transaction {transaction:?} with error: {e}");
            return false;
        };

        // Validate with origin bank
        if let Err(e) = validate_with(&transaction, &transaction.origin.id) {
            error!("Validation with origin bank failed for transaction {transaction:?} with error: {e}");
            return false;
        }

        // Validate with destination bank
        if let Err(e) = validate_with(&transaction, &transaction.destination.id) {
            error!("Validation with destination bank failed for transaction {transaction:?} with error: {e}");
            return false;
        }

        wasmcloud_component::info!("Validation succeeded for transaction {transaction:?}");

        true
    }
}

/// Validates a transaction with the given link name. This component will be linked
/// to multiple validators, and the link name will be used to determine which validator
/// to use.
fn validate_with(transaction: &Transaction, link_name: &str) -> Result<(), String> {
    // wasmpay:platform/validate
    let validate_interface = vec![lattice::CallTargetInterface::new(
        "wasmpay", "platform", "validate",
    )];
    if lattice::set_link_name(link_name, validate_interface).is_err() {
        return Err(format!("Failed to set link name to {link_name}"));
    };
    if validate(transaction) {
        debug!("Validation succeeded for transaction {transaction:?} to {link_name}");
        Ok(())
    } else {
        Err(format!(
            "Validation failed for transaction {transaction:?} to {link_name}"
        ))
    }
}

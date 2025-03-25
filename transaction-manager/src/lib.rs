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
use wasmcloud_component::{debug, error};
use wasmpay::wasmpay::platform::types::{Transaction, ValidateResponse};
use wasmpay::wasmpay::platform::validation::validate;
use wasmpay::Guest;

const WASMPAY_PLATFORM: &str = "wasmpay_platform";

pub struct TransactionManager;
impl Guest for TransactionManager {
    fn validate(transaction: Transaction) -> ValidateResponse {
        wasmcloud_component::info!("Validating transaction {transaction:?}");

        // Run wasmpay validation
        // THOUGHTS: We can live update this component to change validation rules
        // without having to update the transaction-manager component.
        if let ValidateResponse {
            approved: false,
            reason,
        } = validate_with(&transaction, WASMPAY_PLATFORM)
        {
            debug!("Validation failed for transaction {transaction:?} with reason: {reason:?}");
            return ValidateResponse {
                approved: false,
                reason,
            };
        }

        // Validate with origin bank
        if let ValidateResponse {
            approved: false,
            reason,
        } = validate_with(&transaction, &transaction.origin.code)
        {
            error!("Validation with origin bank failed for transaction {transaction:?} with reason: {reason:?}");
            return ValidateResponse {
                approved: false,
                reason,
            };
        }

        // Validate with destination bank
        if let ValidateResponse {
            approved: false,
            reason,
        } = validate_with(&transaction, &transaction.destination.code)
        {
            error!("Validation with destination bank failed for transaction {transaction:?} with reason: {reason:?}");
            return ValidateResponse {
                approved: false,
                reason,
            };
        }

        wasmcloud_component::info!("Validation succeeded for transaction {transaction:?}");

        // TODO: Send HTTP request to backend to process transaction

        ValidateResponse {
            approved: true,
            reason: Some("Transaction is valid and processed".to_string()),
        }
    }
}

/// Validates a transaction with the given link name. This component will be linked
/// to multiple validators, and the link name will be used to determine which validator
/// to use.
///
/// If there isn't a link present, we assume the bank did not include its own validator
fn validate_with(transaction: &Transaction, link_name: &str) -> ValidateResponse {
    // wasmpay:platform/validation
    let validate_interface = vec![lattice::CallTargetInterface::new(
        "wasmpay",
        "platform",
        "validation",
    )];
    if lattice::set_link_name(link_name, validate_interface).is_err() {
        debug!("Failed to set link name to {link_name} for transaction {transaction:?}");
        return ValidateResponse {
            approved: true,
            reason: Some("Bank did not include additional validation rules".to_string()),
        };
    };
    let validate_response = validate(transaction);
    if validate_response.approved {
        debug!("Validation succeeded for transaction {transaction:?} to {link_name}");
    } else {
        debug!("Validation failed for transaction {transaction:?} to {link_name}");
    }
    validate_response
}

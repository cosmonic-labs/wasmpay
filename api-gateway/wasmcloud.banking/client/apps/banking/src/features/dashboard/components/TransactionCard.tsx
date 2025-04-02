import React, {useState} from 'react';
import {Card} from '@repo/ui/Card';
import {cn} from '@repo/ui/cn';
import {Bank} from '../../../../../../packages/common/src/services/user/hooks/useBanks';
import {useApi} from '@repo/common/services/backend/useApi';
import {CreateTransaction} from '@repo/common/services/user/useTransactions';
import {isStandardErrorResponse} from '../../../../../../packages/common/src/services/backend/api/transactions';

// --- Mock Data (Replace with actual data source/props) ---
// const banks = [
//   {id: 'bank1', name: 'Bank A (Checking)'},
//   {id: 'bank2', name: 'Bank B (Savings)'},
//   {id: 'bank3', name: 'Bank C (Investment)'},
// ];

// const currencies = [
//   {code: 'USD', name: 'US Dollar'},
//   {code: 'EUR', name: 'Euro'},
//   {code: 'GBP', name: 'British Pound'},
//   {code: 'JPY', name: 'Japanese Yen'},
// ];
// --- End Mock Data ---

// --- Define Props Type ---
interface TransactionCardProps extends React.HTMLProps<HTMLDivElement> {
  onClose?: () => void; // Make onClose an optional function prop
  banks?: Array<Bank>;
  selectedOriginBank?: Bank;
  selectedDestinationBank?: Bank;
}

const TransactionCard = React.forwardRef<HTMLDivElement, TransactionCardProps>(
  ({className, onClose, ...props}, ref) => {
    // --- State for Form Inputs ---
    const [originBank, setOriginBank] = useState(props.selectedOriginBank?.id || '');
    const [destinationBank, setDestinationBank] = useState(props.selectedDestinationBank?.id || '');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(
      props.selectedDestinationBank?.currency || props.selectedOriginBank?.currency || '',
    );
    const [enableProSearch, setEnableProSearch] = useState(false); // <-- New state for checkbox
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
    const api = useApi();

    // --- End State ---

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!originBank || !destinationBank || !amount || !currency || parseFloat(amount) <= 0) {
        console.log('Validating submit:', {
          sourceBank: originBank,
          destinationBank,
          amount,
          currency,
          proSearchEnabled: enableProSearch, // <-- Include checkbox state
        });
        setError('Please fill in all fields correctly and enter a valid amount.');
        setStatus('error');
        return;
      }

      const origin = props.banks?.find((bank) => bank.id === originBank);
      const destination = props.banks?.find((bank) => bank.id === destinationBank);

      if (!origin || !destination) {
        setError('Invalid bank selection.');
        setStatus('error');
        return;
      }

      setStatus('submitting');
      console.log('Submitting transaction:', {
        sourceBank: originBank,
        destinationBank,
        amount,
        currency,
        proSearchEnabled: enableProSearch, // <-- Include checkbox state
      });

      // --- Add your actual submission logic here (e.g., API call) ---
      // Your API call would likely use the 'enableProSearch' value
      if (originBank === destinationBank) {
        setError('Source and Destination bank cannot be the same.');
        setStatus('error');
      } else {
        const transaction: CreateTransaction = {
          currency: currency,
          amount: parseFloat(amount),
          origin,
          destination,
          status: 'Pending',
          reason: '',
        };

        api
          .createTransaction(transaction, enableProSearch)
          .then((response) => {
            console.dir(JSON.stringify(response.data, null, 2));
            console.log(`Transaction ${response.data.id} created successfully`);
            handleClose();
          })
          .catch((error) => {
            // handle the transaction failed response
            if ('response' in error && isStandardErrorResponse(error.response)) {
              console.error(error.response.message);
              setError(error.response.message);
              setStatus('error');
            } else {
              console.dir(error);
              setStatus('error');
            }
          });
      }
    };

    const handleClose = () => {
      console.log('Close button clicked');
      if (onClose) {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <Card
          ref={ref}
          className={cn(
            'relative w-full max-w-md p-6 bg-card text-card-foreground rounded-lg shadow-xl',
            className,
          )}
          {...props}
        >
          {/* Close Button */}
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              aria-label="Close transaction form"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-5 text-center">New Transaction</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Source Bank */}
            <div>
              <label
                htmlFor="sourceBank"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                From Bank
              </label>
              <select
                id="sourceBank"
                name="sourceBank"
                value={originBank}
                onChange={(e) => setOriginBank(e.target.value)}
                required
                className="w-full p-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              >
                <option value="" disabled>
                  Select Origin Bank
                </option>
                {props.banks
                  ? props.banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            {/* Destination Bank */}
            <div>
              <label
                htmlFor="destinationBank"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                To Bank
              </label>
              <select
                id="destinationBank"
                name="destinationBank"
                value={destinationBank}
                onChange={(e) => setDestinationBank(e.target.value)}
                required
                className="w-full p-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              >
                <option value="" disabled>
                  Select Destination Bank
                </option>
                {props.banks
                  ? props.banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            {/* Amount and Currency */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
              <div className="flex-grow w-full sm:w-auto">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full p-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                  className="w-full sm:w-auto p-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-ring focus:border-ring transition-colors h-[42px]"
                >
                  {props.banks
                    ? props.banks
                        ?.map((b) => b.currency)
                        .map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))
                    : null}
                </select>
              </div>
            </div>

            {/* --- Pro Search Checkbox --- */}
            <div className="flex items-center space-x-2 mt-2">
              {' '}
              {/* Added margin-top */}
              <input
                type="checkbox"
                id="proSearch"
                name="proSearch"
                checked={enableProSearch}
                onChange={(e) => setEnableProSearch(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer" // Basic checkbox styling
              />
              <label
                htmlFor="proSearch"
                className="text-sm font-medium text-muted-foreground cursor-pointer select-none" // Make label clickable
              >
                Enable Pro Transaction Validation (Optional)
              </label>
            </div>
            {/* --- End Pro Search Checkbox --- */}

            {/* Error Placeholder */}
            {error && (
              <div
                className="mt-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className={cn(
                  'inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
                  'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : status === 'success' ? (
                  'Sent!'
                ) : (
                  'Send Money'
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  },
);

TransactionCard.displayName = 'TransactionCard';

export {TransactionCard};

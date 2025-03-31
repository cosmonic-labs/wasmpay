import {Loader2Icon} from 'lucide-react';

function Loader() {
  return (
    <div className="flex items-center justify-center">
      <Loader2Icon className="h-16 w-16 animate-spin" strokeWidth="1" />
    </div>
  );
}

export {Loader};

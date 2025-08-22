import { Crown, Drama } from 'lucide-react';

const MasqueradeLogo = () => {
  return (
    <div className="flex items-center justify-center space-x-3 animate-mysterious-float">
      <Drama className="w-8 h-8 text-primary" />
      <div className="relative">
        <h1 className="text-4xl font-bold bg-gradient-masquerade bg-clip-text text-transparent">
          Echoes of the
        </h1>
        <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent -mt-1">
          Masquerade
        </h2>
        <Crown className="absolute -top-2 -right-8 w-6 h-6 text-secondary animate-masquerade-pulse" />
      </div>
    </div>
  );
};

export default MasqueradeLogo;
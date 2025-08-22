import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MasqueradeLogo from '@/components/game/MasqueradeLogo';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <MasqueradeLogo />
        
        <Card className="backdrop-blur border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription>
              Enter the world of shadows and secrets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/host" className="block">
              <Button className="w-full" size="lg">
                Host Game
              </Button>
            </Link>
            
            <Link to="/join" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Join Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

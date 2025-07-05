import { Button } from './components/ui/button';
import { type User } from '@shared/types';

function App() {
  const user: User = {
    id: '1',
    name: 'John Doe',
  };

  return (
    <>
      <Button>Click me</Button>
    </>
  );
}

export default App;

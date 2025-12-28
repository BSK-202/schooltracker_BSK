
import RootNavigation from './src/components/RootNavigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';


export default function App() {
  return (
    <Provider store={store}>
      <RootNavigation/>
    </Provider>
  );
}
import React from 'react';
import './App.css';
import UI from './features/ui/UI';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router-dom';




const router = createBrowserRouter([
  {
    path: '/',
    element: (
      
        <UI></UI>
    
    ),
  },
  {

  }
]);

function App() {
  return (
    <div className="App">
    {/* <Provider template={AlertTemplate} {...options}> */}
            <RouterProvider router={router} />
          {/* </Provider> */}
    </div>
  );
}

export default App;

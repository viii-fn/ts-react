import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0);

  function LangList() {
    const languages = [
      { "title": "JavaScript", "id": 1 },
      { "title": "TypeScript", "id": 2 },
      { "title": "C#", "id": 2 },
      { "title": "Go", "id": 3 },
      { "title": "C++", "id": 4 },
      { "title": "Rust", "id": 5 },
    ];
    
    return (
      languages.map(language =>
        <li key={language.id}>
          {language.title}
        </li>
      )
    );
  }

  return (
    <>
      <button className="counter" onClick={() => setCount(count + 1)}>
        Count Button <br /> Number of times clicked = {count}
      </button>
      <LangList />
    </>
  )
}

export default App

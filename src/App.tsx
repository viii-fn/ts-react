import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0);

  function LangList() {
    const languages: {
      title: string;
      id: number;
    }[] = [
      { "title": "JavaScript", "id": 1 },
      { "title": "TypeScript", "id": 2 },
      { "title": "C#", "id": 3 },
      { "title": "Go", "id": 4 },
      { "title": "C++", "id": 5 },
      { "title": "Rust", "id": 6 },
    ];
    
    return (
      languages.map(language =>
        <button key={language.id}>
          {language.title}
        </button>
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

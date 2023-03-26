import { useEffect, useState } from 'react'
import ClipLoader from "react-spinners/ClipLoader";
import './App.css'

function App() {
  const [isLoading, setLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState([]);
  const [currentPage , setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/data/${currentPage}`);
      const json = await response.json();
      setLoading(false);
      setFetchedData(json);
    }
    fetchData();
  }, [currentPage]); 



  function prevClick() {
    currentPage > 1 && (
      setCurrentPage(prevPage=> prevPage-1),
      setFetchedData([])
    );
  } 

  function nextClick() {
    setCurrentPage(prevPage=> prevPage+1);
    setFetchedData([]);
  }

  return (
    <div className="flex flex-col  w-full h-full justify-start items-center py-[50px]">
      <div className='w-[550px] flex flex-col space-y-4'>
        <p id="headline" className='text-[32px] tracking-wide'>Apartments for <span className='text-red-600 font-[600]'>SALE</span></p>
        <div className='w-full h-[1px] border-zinc-200 bg-zinc-200 rounded-2xl'></div>
        <div className='w-full flex justify-between items-center'>
          <button onClick={prevClick} className='p-2 bg-white rounded-lg px-4 scale-100 hover:scale-105 transition-all hover:bg-zinc-700 hover:text-white'>Prev</button>
          <p>{currentPage}/500</p>
          <button onClick={nextClick} className='p-2 bg-white rounded-lg px-4 scale-100 hover:scale-105 transition-all hover:bg-zinc-700 hover:text-white'>Next</button>
        </div>
        <div className='flex justify-center'>
          <ClipLoader
            loading={isLoading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
        {fetchedData.map(data => {
          return (
            <div className='w-full bg-white rounded-lg flex space-x-4 h-[120px] shadow-xl hover:scale-105 scale-100 transition-all cursor-pointer'>
              <img src={data["image_url"]} className="w-[40%] rounded-l-lg h-full object-cover" />
              <div className='w-[60%] h-full pt-2'><p>{data["title"]}</p></div>
            </div>
          )
        })}
        <a href="#headline" className='p-2 bg-white flex justify-center cursor-pointer rounded-lg px-4 scale-100 hover:scale-105 transition-all hover:bg-zinc-700 hover:text-white'>Go Back Up</a>
      </div>
    </div>
  )
}

export default App

import axios from "axios";
import { link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const home = () => {
    const [books,setBooks] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5554/product/')
            .then((response) => {
                setBooks(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            })
    } , []);

  return (
    <div className="p-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl my-8">Shivansh Sukhija</h1>
            <tbody>
                {books.map((books , index) => (
                    <tr key={book._id} className="h-8">
                        <td className="border border-slate-700 rounded-md text-center">
                            {index + 1}
                        </td>
                        <td className="border border-slate-700 rounded-md text-center">
                            {book.name}
                        </td> 
                        <td className="border border-slate-700 rounded-md text-center">
                            {book.price}
                        </td>
                    </tr>
                ))}
            </tbody>
        </div>
    </div>
  )
}

export default home

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import './App.css';
import axios from 'axios';

function PaymentForm() {
  const { id, balance } = useParams();
  const [idInput, setIdInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [bankInput, setBankInput] = useState('');
  const [bankingData, setBankingData] = useState([]);
  
  useEffect(() => {
    if (id) {
      setIdInput(id);
    }
    axios.get('https://api.vietqr.io/v2/banks')
    .then(res => {
      setBankingData(res.data.data);
    })
  }, [id]);

  const postDataToGoogleSheets = async (url, action) => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://script.google.com/macros/s/AKfycbzF6eljLRuRmNpKixKQV1Wj0vKC3d77xz43XxsMdNJkuw8JG1W9UTRBQbHdgZy9b15c/exec',
        params: {
          url: url,
          action: action  // add or delete
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const renderBanking = () => {
    return bankingData.map((bank) => {
      return <option value={bank.code}>{bank.name}</option>
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if(Number(amountInput) > Number(balance)) {
      alert('Số tiền bạn muốn chuyển không thể lớn hơn số dư hiện tại!');
      return;
    } 
    let photoUrl = `https://img.vietqr.io/image/${bankInput}-${accountInput}-compact.png?amount=${amountInput}&addInfo=${idInput}`

    postDataToGoogleSheets(photoUrl, "add")
    alert(`Selected bank: ${bankInput}\nID: ${idInput}\nSố Tài Khoản: ${accountInput}\nSố Tiền: ${amountInput}`);
  }


  return (
    <form onSubmit={handleSubmit} className='payment-form'>
      <label htmlFor="id">ID:</label><br/>
      <input type="text" id="id" name="id" defaultValue={idInput} disabled/><br/>
      <label htmlFor="balance">Balance:</label><br/>
      <input type="text" id="balance" name="balance" value={Number(balance).toLocaleString()} disabled/><br/>
      <label htmlFor="bank">Ngân Hàng:</label><br/>
      <select id="bank" name="bank" value={bankInput} onChange={e => setBankInput(e.target.value)}>
        {renderBanking()}
      </select><br/><br/>
      <label htmlFor="account">Số Tài Khoản:</label><br/>
      <input type="text" id="account" name="account" value={accountInput} onChange={e => setAccountInput(e.target.value)}/><br/>
      <label htmlFor="amount">Số Tiền:</label><br/>
      <input type="number" id="amount" name="amount" value={amountInput} onChange={e => setAmountInput(e.target.value)}/><br/>
      <input type="submit" value="Xác Nhận" />
    </form>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:id/:balance" element={<PaymentForm />} />
      </Routes>
    </Router>
  );
}

export default App;
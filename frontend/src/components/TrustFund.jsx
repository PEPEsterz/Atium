import React, { useState, Fragment, useEffect, useRef} from "react";
import { Dialog, Transition } from '@headlessui/react';
import Header from './Header';
import { FaPlus } from 'react-icons/fa';
import { MdContentCopy } from "react-icons/md";
//import React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

import { useProvider, useSigner, useContract, useAccount} from 'wagmi';
import { ATIUM_CONTRACT_ADDRESS, ATIUM_ABI } from './../atiumAbi';
import { ethers } from "ethers";
//import toast from 'react-hot-toast';

const TrustFund = () => {
    const effect = useRef(true);
    const provider = useProvider();
    const signer = useSigner();
    const { address, isConnected } = useAccount();

    const AtiumContract = useContract({
        addressOrName: ATIUM_CONTRACT_ADDRESS,
        contractInterface: ATIUM_ABI,
        signerOrProvider: signer.data || provider,
    });

    const [open, setOpen] = useState(false);
    //state to trigger deposit modal
    const [opendeposit, setOpenDeposit] = useState(false);
    //state to store deposited amount
    const [depositEth, setdepositEth] = useState("");
    //states for the input fields
    //receival sender
    const [receiverAddress, setReceiverAddress] = useState("");
    //start date
    const [startDate, setStartDate] = useState("");
    //wIthdrawal date
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    //interval(in terms of days)
    const [interval, setInterval] = useState("");
    const [activeFundId, setActiveFundId] = useState(0);
    
    //state to keep track of user address
    const [click, setClick] = useState(false);
    //array for the funds
    const [funds, setFunds] = useState([]); 

   
    const mapTrustFund = (trustFund) => {
        let startDate = new Date(trustFund.startDate.toNumber());
        let interval = secondsToDays(trustFund.withdrawalInterval.toNumber());

        let parsedBalance = ethers.utils.formatUnits(trustFund.amount.toNumber(), "ether");
        let parsedGoal = ethers.utils.formatUnits(trustFund.withdrawalAmount.toNumber(), "ether");

        let result = {
            id: trustFund.id.toNumber(),
            sender: trustFund.sender,
            receiver: trustFund.receiver,
            amount: parsedBalance,
            startDate: dateToString(startDate),
            withdrawalAmount: parsedGoal,
            interval: interval,
        }
        return result;
    }

    useEffect(() => {
        if (effect.current) {
            effect.current = false;
            const fetch = async () => {
                try {
                    let trustFundPlans = [];

                    let result = await AtiumContract.getAllActiveTrustfund(address);
                    for(const plan of result) {
                        let mappedPlan = mapTrustFund(plan);
                        trustFundPlans.push(mappedPlan);
                    }

                    setFunds(trustFundPlans);
                } catch(error) {
                    toast.error("Failed fetching funds: " + error.message);
                }
            }
            fetch();
        }
    }, [AtiumContract]);

    let copybtnColor = 'text-[#110f36]';
    //copy button function
    const copyUserAdr = (item) => {
        if (click === false) {
            navigator.clipboard.writeText(item);
            toast.success("Address Copied Successfully");
            copybtnColor = 'text-[#4F46E5]';
            setClick(true);
        } else {
            copybtnColor = 'text-[#110f36]';
            setClick(false);
        }
        setClick(false);
    }

    //function to truncate address
    const truncate = (string) => {
        if(string?.length > 10) {
            return string?.slice(0, 6) + '...' + string?.slice(-4);
        }
    }

    //function to trigger deposit function
    const depositFunds = async (e) => {
        e.preventDefault();
        const _deposit = ethers.utils.parseUnits(depositEth, "ether");
        const options = {
            value: _deposit,
            gasLimit: 100000,
        };

        try {
            const txResponse = await AtiumContract.trustfund(activeFundId, options);
            await txResponse.wait();
        } catch(error){
            toast(error.message);
        }
        setOpenDeposit(true);
    }

    const daysToSeconds = (days) => {
        return (days * 24 * 60 * 60);
    }

    const secondsToDays = (days) => {
        return Math.floor(days/(24 * 60 * 60));
    }

    const dateToString = (date) => {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        let dateString = `${year}/${month}/${day}`;
        console.log("date: ", dateString);

        return dateString;
    }

    const createTrustFund = async() => {
        console.log("creating trust fund");
        try {
            let secondsInterval = daysToSeconds(interval);
            let startTimeStamp = Math.floor(new Date(startDate).getTime() / 1000);

            console.log("address: ", receiverAddress);
            console.log("startTimeStamp: ", startTimeStamp);
            console.log("withdrawalAmount: ", withdrawalAmount);
            console.log("secondsInterval: ", secondsInterval);

            let parsedAmount = ethers.utils.parseUnits(withdrawalAmount, "ether");
            console.log("amount: ", parsedAmount);

            const txResponse = await AtiumContract.trustfundPlan(
                receiverAddress, startTimeStamp, parsedAmount, secondsInterval
            );
            await txResponse.wait();
        } catch(error){
            toast(error.message);
        }
        console.log("created?");
        //
        //
        // setOpenCreate(true);
    }


    const cancelTrustFund = async(id) => {
        console.log("cancelling allowance");
        try {
            const txResponse = await AtiumContract.cancelTrustfund(id);
            await txResponse.wait();
        } catch(error) {
            toast.error(error.message);
        }
    }

    const openDepositModal = (id) => {
        setActiveFundId(id);
        setOpenDeposit(true);
    }

    return ( 
        <div className="flex flex-col sm:mx-[60px] mx-[20px]">
            <ToastContainer
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='light'
            />
            <Header/>
            {/* Create New Plan Button */}
            <div className="flex flex-col justify-between w-full mt-8">
                <div className='w-full rounded-lg pt-2 text-center'>
                    <button className='flex flex-row justify-center border-2 border-[#4F46E5] bg-black h-10 rounded-lg'>
                        <FaPlus className='text-[#fff] mt-3 ml-2'/>
                        <span className=' text-white pt-2 px-2 font--bold' onClick={() => setOpen(true)}>CREATE NEW</span> 
                    </button>
                </div>
            </div>

            {
                funds < 1 ? (
                    <div className="mt-8 mx-auto">
                        <p className='text-[#fff] font-bold sm:text-4xl text-1xl'>You have no TrustFund Plan yet !</p>
                    </div>
                ) : (
                  <>
                    <p className="text-3xl font-black mt-3 text-[#fff]">My TrustFund Plans</p>
                    <div className="image__crop w-full flex flex-row mt-5 p-3 overflow-y-hidden overflow-x-scroll">
                        {
                            funds.map((fund) =>(
                                <div className='h-[320px] w-[246px] px-3 flex flex-row'>
                                    <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg
                                    text-black h-max w-[232px] py-1 px-3 border-2-[#ffffff]
                                    shadow-lg shadow-blue-500/50 hover:shadow-indigo-500/40 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300 rounded-lg mx-2">
                                        <span style={{display:'none'}}>{fund.id}</span>
                                        <div className="flex flex-col justify-between">
                                            <p className="font-bold text-xs text-start text-[#4F46E5]"><span className="text-white">Starts</span> {fund.startDate}</p>
                                            <p className="font-bold text-xs text-end text-[#4F46E5]">Every {fund.interval} days</p>
                                        </div>
                                        <p className="font-semibold pt-2">Deposit:</p>
                                        <p className="text-center text-2xl pt-2">{fund.amount}<sub className="text-white">ETH</sub></p>
                                        <p className="font-semibold pt-2">Withdrawal Amount:</p>
                                        <p className="text-center text-2xl pt-2">{fund.withdrawalAmount}<sub className="text-white">ETH</sub></p>
                                        <div className="flex bg-opacity-60 bg-[#ffffff]  backdrop-filter 
                                        backdrop-blur-lg h-max py-2 pl-1 pr-1 mt-2 rounded-lg">
                                            <div className="justify-between flex flex-row w-[100%] text-[#4F46E5]">
                                                <p>{truncate(fund.receiverAddress)}</p>
                                                <span className={`pt-1 cursor-pointer ${copybtnColor}`}><MdContentCopy onClick={() => copyUserAdr(fund.receiverAddress)}/></span>
                                            </div>
                                        </div>
                                        <div className="flex flex-row justify-between text-sm mt-2 text-[#4F46E5]">
                                            <button onClick={() => cancelTrustFund(fund.id)}>Cancel</button>
                                            <button onClick={() => openDepositModal(fund.id)}>Deposit</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                  </> 
                )
            }

            {/* Modal to Deposit Funds */}
            <Transition.Root show={opendeposit} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpenDeposit}>
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                        {/* Overlay for modal */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" /> 
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                            <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] shadow-xl transition-all mx-2 sm:my-8 sm:w-full w-[95%] h-max sm:max-w-sm">
                                    <div className="flex flex-col px-4 py-2 mx-auto sm:w-full w-[95%] cursor-pointer">
                                        <div className='flex justify-end mt-2'>
                                            <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpenDeposit(false)}>
                                                &times;
                                            </button>
                                        </div>

                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Deposit to this Plan
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='text' value={depositEth} onChange={(e) => setdepositEth(e.target.value)} placeholder="How much do you want to deposit" className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
    
                                        <div className='mt-3 mb-3 w-full'>
                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => depositFunds()}>Deposit</button>
                                        </div>
                                    </div>          
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Modal to get TrustFund details*/}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                        {/* Overlay for modal */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" /> 
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                            <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] shadow-xl transition-all mx-2 sm:my-8 sm:w-full w-[95%] h-max sm:max-w-sm">
                                    <div className="flex flex-col px-4 py-2 mx-auto sm:w-full w-[95%] cursor-pointer">
                                        <div className='flex justify-end mt-2'>
                                            <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                                &times;
                                            </button>
                                        </div>

                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Receiver's Address
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='text' value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Input the receiver address here..." className="border-black bg-white w-full h-full outline-none"/>
                                        </div>

                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Start Date
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Input Your Start Date.." className="border-black bg-white w-full h-full outline-none"/>
                                        </div>

                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Withdrawal Amount
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='text' value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
                                        
                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Interval
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='text' value={interval} onChange={(e) => setInterval(e.target.value)} placeholder="Duration to disburse allowance...e.g 30 days" className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
    
                                        <div className='mt-4 mb-3 w-full'>
                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => createTrustFund()}>Set Allowance</button>
                                        </div>
                                    </div>          
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    )
}

export default TrustFund;
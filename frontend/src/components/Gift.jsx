import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Header from './Header';
import { FaPlus } from 'react-icons/fa';
import { MdContentCopy } from "react-icons/md";
//import React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

import { useProvider, useSigner, useContract, useAccount } from 'wagmi';
import { ATIUM_CONTRACT_ADDRESS, ATIUM_ABI } from './../atiumAbi';
import { ethers } from "ethers";
//import toast from 'react-hot-toast';


// convert string to address before passing to contract?
// convert address to string in mapping?
const Gift = () => {
    const effect = useRef(true);
    const provider = useProvider();
    const signer = useSigner();
    const { address, isConnected } = useAccount();

    const AtiumContract = useContract({
        addressOrName: ATIUM_CONTRACT_ADDRESS,
        contractInterface: ATIUM_ABI,
        signerOrProvider: signer.data || provider,
    });

    // const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    //state to store deposited amount
    const [tokenAmount, setTokenAmount] = useState("");
    //state to trigger deposit modal
    const [openDeposit, setOpenDeposit] = useState(false);
    const [receiverAddress, setReceiverAddress] = useState("");
    const [date, setDate] = useState("");
    //state to keep track of user address
    const [click, setClick] = useState(false);
    const [activePlanId, setActivePlanId] = useState(0);

    //array for the giftPlans
    const [gifts, setGifts] = useState([]);

    const mapGift = (gift) => {
        let date = new Date(gift.date.toNumber());
        let parsedAmount = ethers.utils.formatUnits(gift.amount.toNumber(), "ether");

        let result = {
            id: gift.id.toNumber(),
            senderAddress: gift.sender,
            receiverAddress: gift.receiver,
            date: dateToString(date),
            amount: parsedAmount,
        }
        return result;
    }

    const dateToString = (date) => {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        let dateString = `${year}/${month}/${day}`;
        console.log("date: ", dateString);

        return dateString;
    }

    useEffect(() => {
        if (effect.current) {
            effect.current = false;
            const fetch = async () => {
                try {
                    let giftPlans = [];

                    console.log("Fetching plans...");
                    let result = await AtiumContract.getAllActiveGift(address);
                    console.log("address: ", address);

                    console.log("Plans fetched!");
                    console.log("result: ", result);

                    for(const plan of result) {
                        let mappedPlan = mapGift(plan);
                        giftPlans.push(mappedPlan);
                    }
                    setGifts(giftPlans);
                } catch(error) {
                    toast.error("Failed fetching funds: " + error.message);
                }
            }
            fetch();
        }
    }, [AtiumContract]);


    //function to truncate address
    const truncate = (string) => {
        if(string?.length > 10) {
            return string?.slice(0, 6) + '...' + string?.slice(-4);
        }
    }

    const openDepositModal = (id) => {
        //e.preventDefault();
        setActivePlanId(id);
        setOpenDeposit(true);
    }

    //function to trigger deposit function
    const deposit = async (id) => {
        console.log("Depositing funds");
        let _deposit = ethers.utils.parseUnits(tokenAmount, "ether");
        const options = {
            value: _deposit,
            gasLimit: 100000,
        };

        try {
            const txResponse = await AtiumContract.gift(activePlanId, options);
            await txResponse.wait();
        } catch(error){
            toast(error.message);
        }
        setOpenDeposit(true);
    }

    const createGift = async() => {
        //e.preventDefault();
        try {
            console.log("receiverAddress: ", receiverAddress);
            let dateTimeStamp = Math.floor(new Date(date).getTime() / 1000);
            const txResponse = await AtiumContract.giftPlan(receiverAddress, dateTimeStamp);
            await txResponse.wait();
        } catch(error){
            toast(error.message);
        }
        //
        //
        // setOpenCreate(true);
    }

    const cancelGift = async(id) => {
        try {
            const txResponse = await AtiumContract.cancelGift(id);
            await txResponse.wait();
        } catch(error) {
            toast(error.message);
        }
    
    }
        
    let copybtnColor = 'text-[#110f36]';
    //copy button function
    const copyUserAdr = (item) => {
        if (click === false) {
            navigator.clipboard.writeText(item);
            toast.success("Address Copied Successfully");
            setClick(true);
        } else {
            setClick(false);
        }
        setClick(false);
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
                        <span className='text-white pt-2 px-2 font--bold' onClick={() => setOpen(true)}>CREATE NEW</span> 
                    </button>
                </div>
            </div>

            {
                gifts < 1 ? (
                    <div className="mt-8 mx-auto">
                        <p className='text-[#fff] font-bold text-4xl'>You have no Gift Plan yet !</p>
                    </div>
                ) : (
                  <>
                    <p className="text-3xl font-black mt-3 text-[#fff]">My Gift Plans</p>
                    <div className="image__crop w-full flex flex-row mt-5 mx-auto overflow-y-hidden overflow-x-scroll">
                        {
                            gifts.map((gift) =>(
                                <div className='h-[332px] w-[250px] pt-2 pb-3 px-3'>
                                    <div className="bg-white p-5 bg-opacity-60 backdrop-filter backdrop-blur-lg
                                    text-black h-max w-[226px] py-2 px-4 border-2-[#ffffff]
                                    shadow-lg shadow-blue-500/50 hover:shadow-indigo-500/40 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300 rounded-lg mx-2">
                                        <span style={{display:'none'}}>{gift.id}</span>
                                        <p className="font-semibold pt-3">Deposit:</p>
                                        <p className="text-center text-2xl pt-3">{gift.amount}<sub className="text-white">ETH</sub></p>
                                        <p className="font-semibold pt-3">Date:</p>
                                        <p className="text-center text-2xl pt-3">{gift.date}</p>
                                        <div className="flex bg-opacity-60 bg-[#ffffff]  backdrop-filter 
                                        backdrop-blur-lg h-max py-2 pl-1 pr-1 mt-2 rounded-lg">
                                            <div className="justify-between flex flex-row w-[100%] text-[#4F46E5]">
                                                <p>{truncate(gift.receiverAddress)}</p>
                                                <span className={`pt-1 cursor-pointer ${copybtnColor}`}><MdContentCopy onClick={() => copyUserAdr(gift.receiverAddress)}/></span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row justify-between text-sm mt-2 text-[#4F46E5]">
                                            <button onClick={() => cancelGift(gift.id)}>Cancel</button>
                                            <button onClick={() => openDepositModal(gift.id)}>Deposit</button>
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
            <Transition.Root show={openDeposit} as={Fragment}>
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
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] shadow-xl transition-all mx-2 sm:my-8 sm:w-full h-max sm:max-w-sm">
                                    <div className="flex flex-col px-4 py-2 mx-auto w-full cursor-pointer">
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
                                            <input type='text' value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="How much do you want to deposit" className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
    
                                        <div className='mt-3 mb-3 w-full'>
                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => deposit}>Deposit</button>
                                        </div>
                                    </div>          
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Modal to get Gift plan details*/}
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
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] shadow-xl transition-all mx-2 sm:my-8 sm:w-full h-max sm:max-w-sm">
                                    <div className="flex flex-col px-4 py-2 mx-auto w-full cursor-pointer">
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
                                            <input type='text' value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Input the Receiver's Address" className="border-black bg-white w-full h-full outline-none"/>
                                        </div>

                                        <div className="sm:flex py-2">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                Date
                                            </Dialog.Title>
                                        </div>

                                        <div className="inline-flex w-full mb-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                            <input type='date' value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date you want the gift to be accessible..." className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
    
                                        <div className='mt-3 mb-3 w-full'>
                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => createGift()}>Gift</button>
                                        </div>
                                    </div>          
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>


        </div>
    );
}
 
export default Gift;
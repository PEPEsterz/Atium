import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Header from './Header';
import { FaPlus } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
import { BsArrowLeftShort } from "react-icons/bs";

import { useProvider, useSigner, useContract, useAccount } from 'wagmi';
import { ATIUM_CONTRACT_ADDRESS, ATIUM_ABI } from './../atiumAbi';
import { MdContentCopy } from "react-icons/md";
//import React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const Savings = () => {
    // Questionable?
    const effect = useRef(true);
    const provider = useProvider();
    const signer = useSigner();
    const {address, isConnected } = useAccount();

    const AtiumContract = useContract({
        addressOrName: ATIUM_CONTRACT_ADDRESS,
        contractInterface: ATIUM_ABI,
        signerOrProvider: signer.data || provider,
    });

    // const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    //state to trigger deposit modal
    const [opendeposit, setOpenDeposit] = useState(false);
    const [planmodal, setPlanModal] = useState(false);
    const [plantext, setPlanText] = useState("Select a Plan");
    const [goalamt, setGoalAmt] = useState("");
    const [locktime, setLockTime] = useState("");
    // const [data, setData] = useState([]);
    let [page, setPage] = useState(1);
    //array for the plans
    const [plans, setPlans] = useState([]);
    //active plan
    const [activePlanId, setActivePlanId] = useState(0);
    //set loading state
    const [loading, setLoading] = useState(false);
    //state to store deposited amount
    const [deposit, setDeposit] = useState("");
    const [editAmount, setEditAmount] = useState(0);

    const mapSavingsPlan = (plan) => {
        console.log("Mapping savings");
        let parsedBalance = ethers.utils.formatUnits(plan.amount, "ether");
        let parsedGoal = ethers.utils.formatUnits(plan.goal, "ether");

        let result = {
            id: plan.id.toNumber(),
            address: plan.user,
            amount_saved: parsedBalance,
            goal_amount: parsedGoal,
            timeLock: plan.time.toNumber(),
        }
        console.log("timelock: ", result.timeLock);
        console.log("End mapping savings");
        return result;
    }
    //state to keep track of user address
    const [click, setClick] = useState(false);
    // let [copybtnColor, setCopyBtnColor] = useState('text-[#110f36]');

    // const dataArray = [
    //     {
    //         id: 1,
    //         plan_type: 'Goal',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189411",
    //         amount_saved: '0',
    //         goal_amount: 20,
    //         timeLock: ''
    //     },
    //     {
    //         id: 2,
    //         plan_type: 'Time Lock',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189412",
    //         amount_saved: '0',
    //         goal_amount: " ",
    //         timeLock: '2023-05-10'
    //     },
    //     {
    //         id: 3,
    //         plan_type: 'Time Lock',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
    //         amount_saved: '0',
    //         goal_amount: " ",
    //         timeLock: '2023-04-20'
    //     },
    //     {
    //         id: 4,
    //         plan_type: 'Goal',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189414",
    //         amount_saved: '20',
    //         goal_amount: 20,
    //         timeLock: ''
    //     },
    //     {
    //         id: 5,
    //         plan_type: 'Time Lock',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189415",
    //         amount_saved: '0',
    //         goal_amount: " ",
    //         timeLock: '2022-04-08'
    //     },
    //     {
    //         id: 6,
    //         plan_type: 'Time Lock',
    //         address: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189416",
    //         amount_saved: '0',
    //         goal_amount: " ",
    //         timeLock: '2023-06-08'
    //     },
    // ]
    // setData(dataArray);

    
    useEffect(() => {
        if (effect.current) {
            effect.current = false;
            const fetch = async () => {
                try {
                    setLoading(true);
                    let plansArray = [];

                    console.log("Fetching plans...");
                    console.log("address: ", address);
                    let result = await AtiumContract.getAllActiveSavings(address);
                    console.log("address: ", address);

                    console.log("Plans fetched!");
                    console.log("result: ", result);

                    for (const savings of result) {
                        let mappedPlan = mapSavingsPlan(savings);
                        plansArray.push(mappedPlan);
                    }
            
                    setPlans(plansArray);
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    toast.error("failed fetching savings" + error.message);
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
            copybtnColor = 'text-[#4F46E5]';
            toast.success("Address Copied Successfully");
            setClick(true);
        } else {
            copybtnColor = 'text-[#110f36]';
            setClick(false);
        }
        setClick(false);
    }

    const prev_step = (e) => {
        e.preventDefault();
        if (page >= 2) {
            setPage(1);
        }
    }

    const set_plan = (e) => {
        e.preventDefault();
        if (plantext === "Goal") {
            setPage(2);
        } else {
            setPage(3);
        }
    }

    const saveGoalPlan = async (e) => {
        e.preventDefault();

        console.log("Saving goal plan");
        let parsedAmount = ethers.utils.parseUnits(goalamt, "ether");
        console.log("amount: ", parsedAmount);
        try {
            const txResponse = await AtiumContract.savingsPlanGoal(parsedAmount);
            await txResponse.wait();
        } catch(error) {
            console.log(error.message);
            toast.error("failed saving goal plan: " + error.message);
        }

        setPage(1);
        setOpen(false);
    }

    // Tell Gbolahan to set assert logic in the contract that fails if
    // timeElapsed >= 0 or isn't greater than a minimum
    const saveLockPlan = async (timeValue) => {
        let currentDate = new Date();
        let futureDate = new Date(timeValue);

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        let current = `${day}-${month}-${year}`;

        let day2 = futureDate.getDate();
        let month2 = futureDate.getMonth() + 1;
        let year2 = futureDate.getFullYear();
        let future = `${day2}-${month2}-${year2}`;

        console.log("currentDate: ", current);
        console.log("futureDate: ", future);

        if(futureDate.getTime() <= currentDate.getTime()) {
            setLockTime("");
            toast.error("Enter a future date.");
        } else {
            setLockTime(timeValue);
        }

        console.log("Saving lock plan");
        let lockTimeStamp = Math.floor(new Date(locktime).getTime() / 1000);
        console.log("lockTimeStamp: ", lockTimeStamp);

        try {
            const txResponse = await AtiumContract.savingsPlan(lockTimeStamp);
            await txResponse.wait();
            console.log("lock time saved");
        } catch(error) {
            toast.error(error.message);
        }

        setPage(1);
        setOpen(false);
        setLockTime("");
    }

    //function to open plan type modal
    const openPlan = () => {
        if (planmodal === false) {
            setPlanModal(true);
        } else {
            setPlanModal(false);
        }
    }

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

    const withdrawButtonActive = (goal_amount, timeLock, amount_saved, id) => {
        let presentDate = new Date();
        let lockTime =  new Date(timeLock);

        let day = presentDate.getDate();
        let month = presentDate.getMonth() + 1;
        let year = presentDate.getFullYear();
        let current = `${day}-${month}-${year}`;

        let day2 = lockTime.getDate();
        let month2 = lockTime.getMonth() + 1;
        let year2 = lockTime.getFullYear();
        let future = `${day2}-${month2}-${year2}`;
        if ((lockTime !== "" && current.getTime() >= future.getTime()) || (goal_amount !== "" && Number(amount_saved) >= Number(goal_amount))) {
            return <button onClick={() => withdrawSavings(id)}>Withdraw</button>
        } else {
            return <button onClick={()=> cancelSavings(id)}>Cancel</button>
        }
    }

    const withdrawSavings = async (id) => {
        //e.preventDefault();
        console.log("Withdrawing savings!");
        try {
            const options = {gasLimit: 100000,};
            const txResponse = await AtiumContract.w_save(id, options);
            await txResponse.wait();
        } catch(error) {
            console.log(error);
            console.log(error.message);
            toast.error(error.message);
        }
    }

    //function to trigger deposit function
    const depositFunds = async () => {
        //e.preventDefault();
        console.log("Depositing funds");
        let parsedDeposit = ethers.utils.parseUnits(deposit, "ether");
        let _deposit = ethers.utils.parseUnits(deposit, "ether");

        console.log("parsedDeposit: ", parsedDeposit);
        console.log("_deposit: ", _deposit);

        const options = {
            value: _deposit,
            gasLimit: 100000,
        };

        try {
            const txResponse = await AtiumContract.save(activePlanId, options);
            await txResponse.wait();
        } catch(error) {
            toast.error(error.message);
            console.log("Error encountered: ", error.message);
        }
        
        setOpenDeposit(true);
    }
    /*
    - let copy button work. set onClick animation
    - I want the UI to display a `fetching plans..` message while the page first
    loads and only show a `You have no active plans` message when we've tried to
    fetch and get nothing
    - Convert date arg to timeElapsed before passing into blockchain
    - Compare goals/dates to toggle between withdraw or cancel
    - Make it such that users can't pick a date in the past
    - date should be in format YYYY-MM-DD
    */

    const cancelSavings = async (id) => {
        console.log("Cancelling plan");
        try {
            const txResponse = await AtiumContract.cancelSavings(id);
            await txResponse.wait();
        } catch(error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="flex flex-col sm:mx-[60px] mx-[10px]">
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
                loading ? (
                    <div className="mt-8 mx-auto">
                        <p className='text-[#fff] font-bold sm:text-4xl text-1xl'>Fetching Plans....</p>
                    </div>
                ) : (
                plans < 1 ? (
                    <div className="mt-8 mx-auto">
                        <p className='text-[#fff] font-bold sm:text-4xl text-1xl'>You have no Savings Plan yet !</p>
                    </div>
                ) : (
                  <>
                    <p className="text-3xl font-black mt-3 text-[#fff]">My Saving Plans</p>
                    <div className="image__crop w-full flex flex-row mt-5 mx-auto overflow-y-hidden overflow-x-scroll">
                        {
                            plans.map((plan) =>(
                                <div className='h-[292px] sm:w-[226px] w-[90%] pt-2 pb-3 px-3'>
                                    <div className="bg-white p-5 bg-opacity-60 backdrop-filter backdrop-blur-lg
                                    text-black h-max w-[202px] py-2 px-4 border-2-[#ffffff]
                                    shadow-lg shadow-blue-500/50 hover:shadow-indigo-500/40 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300 rounded-lg mx-2">
                                        <span style={{display:'none'}}>{plan.id}</span>
                                        <p className="font-bold text-xs text-end text-[#4F46E5]">{plan.plan_type} plan</p>
                                        <p className="font-semibold pt-3">Amount Saved:</p>
                                        <p className="text-center text-2xl pt-3">{plan.amount_saved}<sub className="text-white">MATIC</sub></p>
                                        {console.log(plan.amount_saved)}
                                        <p className="font-semibold pt-3">
                                            {
                                                plan.goal_amount !== "" || Number(plan.goal_amount) !== 0 ? (
                                                   <>Goal Amount:</> 
                                                ) : (
                                                    <>Time Lock:</>
                                                )
                                            }
                                        </p>
                                        <p className="text-center text-2xl pt-3">
                                            {
                                                plan.goal_amount !== " " ? (
                                                    <>
                                                     {plan.goal_amount}<sub className="text-white">MATIC</sub>   
                                                    </>
                                                ) : (
                                                    <>
                                                      {plan.timeLock} 
                                                    </>
                                                )
                                            }
                                        </p>
                                        <div className="justify-between flex flex-row w-[100%] bg-[#ffffff] text-[#4F46E5] bg-opacity-60 backdrop-filter 
                                        backdrop-blur-lg h-max py-2 pl-1 pr-1 mt-2 rounded-lg">
                                            <p>{truncate(plan.address)}</p>
                                            <span className={`pt-1 cursor-pointer ${copybtnColor}`}><MdContentCopy onClick={() => copyUserAdr(plan.address)}/></span>
                                        </div>

                                        <div className="flex flex-row justify-between text-sm mt-2 text-[#4F46E5]">
                                            {withdrawButtonActive(plan.goal_amount, plan.timeLock, plan.amount_saved, plan.id)}
                                            <button onClick={()=> openDepositModal(plan.id)}>Deposit</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                  </> 
                )
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
                                            <input type='text' value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="How much do you want to deposit" className="border-black bg-white w-full h-full outline-none"/>
                                        </div>
    
                                        <div className='mt-3 mb-3 w-full'>
                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => depositFunds()} >Deposit</button>
                                        </div>
                                    </div>          
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Modal to run the savings plan */}
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] shadow-xl transition-all sm:mx-2 mx-auto sm:my-8 sm:w-full w-[95%] h-max sm:max-w-sm">
                                {
                                    page === 1 ? (
                                        <div className="flex flex-col px-4 py-2 mx-auto w-full cursor-pointer">
                                            <div className='flex justify-end mt-2'>
                                                <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                                    &times;
                                                </button>
                                            </div>
                                            <div className="sm:flex py-2">
                                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff] mb-3">
                                                    Choose your plan type
                                                </Dialog.Title>
                                            </div>
                                            
                                            <div onClick={openPlan} className="inline-flex justify-between appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                                <p className='font-medium text-2xl pl-2 justify-start'>{plantext}</p>
                                                <ChevronDownIcon className="-mr-1 ml-2 h-8 w-8" aria-hidden="true"/>
                                            </div>

                                            {
                                                planmodal && (
                                                    <div className='flex flex-col rounded-md border border-gray-300 bg-white mt-3 px-2 py-2 text-2xl font-medium text-gray-700 shadow-sm hover:bg-gray-50'>
                                                        <p className="hover:bg-zinc-400 border-1 border-[#ffff] rounded-md h-max py-2 text-start" onClick={() => [setPlanText('Goal'), setPlanModal(false)]}>Goal</p>
                                                        <p className="hover:bg-zinc-400 border-1 border-[#ffff] rounded-md h-max py-2 text-start" onClick={() => [setPlanText('Lock Time'), setPlanModal(false)]}>Lock Time</p>
                                                    </div>
                                                )
                                            }

                                            <div className='mt-3 mb-3 w-full'>
                                                <button className='h-[40px] w-full bg-[#3e00b3] hover:opacity-60 text-white rounded-lg font-bold' onClick={set_plan}>Set Plan</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col px-4 py-2 mx-auto w-full cursor-pointer">
                                            {
                                                page === 2 ? (
                                                    <> 
                                                        <div className="flex flex-row justify-between">
                                                            <div className='flex justify-start mt-2' onClick={prev_step}>
                                                                <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full">
                                                                    <BsArrowLeftShort className='pl-2'/>
                                                                </button>
                                                            </div>
                                                            <div className='flex justify-start mt-2'>
                                                                <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="sm:flex py-2 px-2">
                                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#4F46E5] mb-3">
                                                                Goal Plan Type
                                                            </Dialog.Title>
                                                        </div>  

                                                        <div className="inline-flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                                            <input type='text' placeholder="Input Your Goal Amount..." value={goalamt} onChange={(e) => setGoalAmt(e.target.value)} className="border-black bg-white w-full h-full outline-none"/>
                                                        </div>

                                                        <div className='mt-3 mb-3 w-full'>
                                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={saveGoalPlan}>Save Plan</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-row justify-between">
                                                            <div className='flex justify-start mt-2' onClick={prev_step}>
                                                                <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full">
                                                                    <BsArrowLeftShort className='pl-2'/>
                                                                </button>
                                                            </div>
                                                            <div className='flex justify-start mt-2'>
                                                                <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="sm:flex py-2 px-2">
                                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#4F46E5] mb-3">
                                                                Lock Time Plan Type
                                                            </Dialog.Title>
                                                        </div>  

                                                        <div className="inline-flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 ">
                                                            <input type='date' placeholder= "YYYY-MM-DD" value={locktime} onChange={(e) => setLockTime(e.target.value)} className="border-black bg-white w-full py-2 h-full outline-none"/>
                                                        </div>

                                                        <div className='mt-3 mb-3 w-full'>
                                                            <button className='h-[40px] w-full bg-[#3e00b3] text-white rounded-lg font-bold' onClick={() => saveLockPlan(locktime)}>Save Plan</button>
                                                        </div>
                                                    </> 
                                                )
                                            }
                                        </div>
                                    ) 
                                }
                            </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
 
export default Savings;
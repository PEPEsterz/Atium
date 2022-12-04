import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MdOutlineSavings } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import { BsGift } from 'react-icons/bs';
import { SlDocs } from 'react-icons/sl';
import Navbar from './Navbar';
import '../style/Home.css'

const Home = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    return (
        <div className='landing__section sm:mx-4 mx-2 h-[100vh] overflow-x-hidden overflow-y-hidden'>
            <Navbar/>
            <div className='flex flex-col text-center items-center sm:mt-10 mt-3 sm:w-[70%] w-[95%] mx-auto'>
                <div>
                    <h1 className='sm:mt-5 sm:text-[60px] text-[25px] font-black text-white inline-block'><span>Automated Payment Protocol</span> on Polygon</h1>
                    <p className='sm:mt-5 sm:text-[20px] text-[12px] w-[90%] text-[#000000] text-center items-center mx-auto text-gray sm:w-[80%]'>We want disbursements of funds to be as easy as possible. 
                    Automated payment of allowances and trustfunds to beneficiaries</p>
                </div>

                <div className='sm:mt-5 mt-2 flex sm:flex-row flex-col sm:space-x-3 sm:space-y-0 space-y-3'>
                    <button className='h-[50px] sm:w-[250px] w-[90vw] text-xl font-extrabold bg-black hover:bg-[#252626] text-white outline-none cursor-pointer border-1-transparent rounded-lg' onClick={() => setOpen(true)}>GET STARTED</button>
                    <Link to={{ pathname: "https://github.com/shegz101/Atium/blob/main/README.md" }} target="_blank">
                        <button className='sm:h-[50px] sm:w-[250px] w-[90vw] px-2 py-2 text-xl flex flex-row justify-center font-extrabold bg-[transparent] hover:bg-black hover:text-white border-2 border-black text-black outline-none cursor-pointer rounded-lg'>
                            <span className='pr-1'>LEARN MORE</span>
                            <span className="pt-1 pl-1"><SlDocs className='font-black'/></span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* The footer arc */}
            <div className="arc w-full"></div>
            
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                                <div className='flex justify-end mr-4 mt-2'>
                                    <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                        &times;
                                    </button>
                                </div>
                                <div className="flex sm:flex-col flex-col px-4 py-3 mx-auto justify-center w-full cursor-pointer">
                                    <div onClick={() => navigate('/saving')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center mt-3 justify-center rounded-full text-white sm:mx-0 sm:h-10 sm:w-10">
                                            <MdOutlineSavings className="h-8 w-8 text-[#fff]-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff]">
                                                Savings Plan
                                            </Dialog.Title>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-500">
                                                    You can either save to a goal amount or to a date.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/allowance')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center mt-3 justify-center rounded-full text-white sm:mx-0 sm:h-10 sm:w-10">
                                            <MdOutlineSavings className="h-8 w-8 text-[#fff]-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff]">
                                                Allowance Plan
                                            </Dialog.Title>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-500">
                                                    You can easily send allowance to someone by setting the interval.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/gift')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center mt-3 justify-center rounded-full text-white sm:mx-0 sm:h-10 sm:w-10">
                                            <BsGift className="h-7 w-7 text-[#fff]-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff]">
                                                Gift Plan
                                            </Dialog.Title>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-500">
                                                    You can gift friend and also set when it will be accessible.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/trustfund')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center mt-3 justify-center rounded-full text-white sm:mx-0 sm:h-10 sm:w-10">
                                            <MdOutlineSavings className="h-8 w-8 text-[#fff]-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[#fff]">
                                                Trust Fund Plan
                                            </Dialog.Title>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-500">
                                                    You can either save to a goal or to an amount.
                                                </p>
                                            </div>
                                        </div>
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

export default Home

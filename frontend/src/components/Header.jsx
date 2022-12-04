import React, { useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import '../style/Header.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate, Link } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";

const Header = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    return (
        <div>
            <div className="flex justify-between">
                <div className="flex ">
                    <Link to="/">
                        <p className="text-[25px] mt-1 font-bold text-[#fff]"><span className='text-[#4F46E5]'>Ati</span>um</p>
                    </Link>
                </div>
                    
                <div className='flex gap-x-2 sm:space-x-3 sm:font-bold'>
                    <nav className="text-[#fff] text-[20px] pt-3 font-medium lg:flex sm:flex flex-row hidden md:hidden space-x-6">
                        <Link to="/saving">
                            <p className="hover:opacity-60">Savings</p>
                        </Link>
                        <Link to="/allowance">
                            <p className="hover:opacity-60">Allowance</p>
                        </Link>
                        <Link to="/trustfund">
                            <p className="hover:opacity-60">TrustFund</p>
                        </Link>
                        <Link to="/gift">
                            <p className="hover:opacity-60">Gift</p> 
                        </Link> 
                    </nav>
                        
                    <div className="mt-2">
                        <ConnectButton/>
                    </div>

                    <div className="sm:hidden lg:hidden inline-block md:inline-block mt-2">
                        <GiHamburgerMenu className="h-10 w-10 cursor-pointer text-[#fff]" onClick={() => setOpen(true)}/>
                    </div>
                </div>
            </div>

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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#000000] text-center shadow-xl transition-all sm:my-8 sm:w-full w-[95%] sm:max-w-sm">
                                <div className='flex justify-end mr-4 mt-2'>
                                    <button className="bg-zinc-700 hover:bg-zinc-800 h-[30px] w-[30px] text-[20px] text-gray-500 font-black cursor-pointer rounded-full" onClick={() => setOpen(false)}>
                                        &times;
                                    </button>
                                </div>
                                <div className="flex sm:flex-col flex-col px-4 py-3 mx-auto justify-center w-full cursor-pointer">
                                    <div onClick={() => navigate('/saving')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-[#fff]">
                                                Savings
                                            </Dialog.Title>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/allowance')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-[#fff]">
                                                Allowance
                                            </Dialog.Title>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/gift')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-[#fff]">
                                                Gift
                                            </Dialog.Title>
                                        </div>
                                    </div>

                                    <div onClick={() => navigate('/trustfund')} className="sm:flex sm:justify-between mb-2 hover:bg-zinc-800 rounded-lg py-2 px-2">
                                        <div className="mt-3 flex flex-col sm:text-left text-center">
                                            <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-[#fff]">
                                                TrustFund
                                            </Dialog.Title>
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

export default Header;
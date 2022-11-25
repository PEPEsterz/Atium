//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";

error Atium_NotOwnerId();
error Atium_OnlyFutureDate();
error Atium_ZeroInput();

contract AtiumPlan {
    using Counters for Counters.Counter;

    Counters.Counter private _atiumId;
    Counters.Counter private _savingsId;
    Counters.Counter private _allowanceId;
    Counters.Counter private _trustfundId;
    Counters.Counter private _giftId;

    mapping(uint256 => AtiumList) internal atiumById;
    mapping(uint256 => SavingsList) internal savingsById;
    mapping(uint256 => AllowanceList) internal allowanceById;
    mapping(uint256 => TrustFundList) internal trustfundById;
    mapping(uint256 => GiftList) internal giftById;

    mapping(uint256 => uint256) internal allowanceDate;
    mapping(uint256 => uint256) internal trustfundDate;

    enum Select {SAVINGS, ALLOWANCE, TRUSTFUND, GIFT}
    //SAVINGS = 0, ALLOWANCE = 1, TRUSTFUND = 2. GIFT = 3

    /*///////////////////////////////////////////////////////////////
                            Events
    //////////////////////////////////////////////////////////////*/

    event Savings(uint256 id, address indexed user, uint256 deposit, uint256 goal, uint256 time);

    event Allowance(
        uint256 id, 
        address indexed user,
        address indexed receiver, 
        uint256 deposit,
        uint256 startDate,
        uint256 withdrawal,
        uint256 interval
        );

    event Trustfund(
        uint256 id, 
        address indexed user,
        address indexed receiver, 
        uint256 deposit,
        uint256 startDate,
        uint256 withdrawal,
        uint256 interval
        );

    event Gift(
        uint256 id, 
        address indexed user, 
        address indexed receiver, 
        uint256 deposit,
        uint256 date
        );

    struct AtiumList {
        uint256 id;
        address user;
        Select select;
    }

    struct SavingsList {
        uint256 id;
        address user;
        uint256 amount;
        uint256 goal;
        uint256 time;
    }

    struct AllowanceList {
        uint256 id;
        address sender;
        address receiver;
        uint256 deposit;
        uint256 startDate;
        uint256 withdrawalAmount;
        uint256 withdrawalInterval;
    }

    struct TrustFundList {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        uint256 startDate;
        uint256 withdrawalAmount;
        uint256 withdrawalInterval;
    }

    struct GiftList {
        uint256 id;
        address sender;
        address receiver;
        uint256 date;
        uint256 amount;
    }

    /////////////////////////////////////////////////////////
    /////////////////  ATIUM PLANS FUNCTIONS  ///////////////
    /////////////////////////////////////////////////////////

    function savingsPlanGoal(uint256 _goal) external {
        if (_goal == 0) {
            revert Atium_ZeroInput();
        }
        _atiumId.increment();
        _savingsId.increment();

        AtiumList memory a = AtiumList ({
            id: _atiumId.current(),
            user: msg.sender,
            select: Select.SAVINGS
        });

        SavingsList memory s = SavingsList ({
            id: _savingsId.current(),
            user: msg.sender,
            amount: savingsById[_savingsId.current()].amount,
            goal: _goal,
            time: 0
        });

        atiumById[_atiumId.current()] = a;
        savingsById[_savingsId.current()] = s;

        emit Savings(
            _savingsId.current(), 
            msg.sender, 
            savingsById[_savingsId.current()].amount,
            _goal, 
            0
            );
    }

    function savingsPlanTime(uint256 _time) external {
        if (_time == 0) {
            revert Atium_ZeroInput();
        }
        _atiumId.increment();
        _savingsId.increment();
        _time += block.timestamp;

        AtiumList memory a = AtiumList ({
            id: _atiumId.current(),
            user: msg.sender,
            select: Select.SAVINGS
        });

        SavingsList memory s = SavingsList ({
            id: _savingsId.current(),
            user: msg.sender,
            amount: savingsById[_savingsId.current()].amount,
            goal: 0,
            time: _time
        });

        atiumById[_atiumId.current()] = a;
        savingsById[_savingsId.current()] = s;

        emit Savings(
            _savingsId.current(), 
            msg.sender, 
            savingsById[_savingsId.current()].amount,
            0, 
            _time
            );
    }

    function allowancePlan(
        address _receiver, 
        uint256 _startDate, 
        uint256 _amount, 
        uint256 _interval
        ) external {
        
        if (_receiver == address(0) || _startDate == 0 || _amount == 0 || _interval == 0) {
            revert Atium_ZeroInput();
        }

        _atiumId.increment();
        _allowanceId.increment();
        _startDate += block.timestamp;

        AtiumList memory a = AtiumList ({
            id: _atiumId.current(),
            user: msg.sender,
            select: Select.ALLOWANCE
        });

        AllowanceList memory al = AllowanceList ({
            id: _allowanceId.current(),
            sender: msg.sender,
            receiver: _receiver,
            deposit: allowanceById[_allowanceId.current()].deposit,
            startDate: _startDate,
            withdrawalAmount: _amount,
            withdrawalInterval: _interval
        });

        atiumById[_atiumId.current()] = a;
        allowanceById[_allowanceId.current()] = al;
        allowanceDate[_allowanceId.current()] = _startDate;

        emit Allowance(
        _allowanceId.current(), 
        msg.sender,
        _receiver, 
        allowanceById[_allowanceId.current()].deposit,
        _startDate,
        _amount,
        _interval
        );
    }

    function trustfundPlan(
        address _receiver, 
        uint256 _startDate, 
        uint256 _amount, 
        uint256 _interval
        ) external {

        if (_receiver == address(0) || _startDate == 0 || _amount == 0 || _interval == 0) {
            revert Atium_ZeroInput();
        }

        _atiumId.increment();
        _trustfundId.increment();
        _startDate += block.timestamp;

        AtiumList memory a = AtiumList ({
            id: _atiumId.current(),
            user: msg.sender,
            select: Select.TRUSTFUND
        });

        TrustFundList memory t = TrustFundList ({
            id: _trustfundId.current(),
            sender: msg.sender,
            receiver: _receiver,
            amount: trustfundById[_trustfundId.current()].amount,
            startDate: _startDate,
            withdrawalAmount: _amount,
            withdrawalInterval: _interval
        });

        atiumById[_atiumId.current()] = a;
        trustfundById[_trustfundId.current()] = t;
        trustfundDate[_trustfundId.current()] = _startDate;

        emit Trustfund(
        _trustfundId.current(), 
        msg.sender,
        _receiver, 
        trustfundById[_trustfundId.current()].amount,
        _startDate,
        _amount,
        _interval
        );
    }

    function giftPlan(address _receiver, uint256 _date) external {

        if (_receiver == address(0) || _date == 0) {
            revert Atium_ZeroInput();
        }

        _atiumId.increment();
        _giftId.increment();
        _date += block.timestamp;

        AtiumList memory a = AtiumList ({
            id: _atiumId.current(),
            user: msg.sender,
            select: Select.GIFT
        });

        GiftList memory g = GiftList ({
            id: _giftId.current(),
            sender: msg.sender,
            receiver: _receiver,
            amount: giftById[_giftId.current()].amount,
            date: _date
        });

        atiumById[_atiumId.current()] = a;
        giftById[_giftId.current()] = g;

        emit Gift(
            _giftId.current(), 
            msg.sender, 
            _receiver, 
            giftById[_giftId.current()].amount,
            _date
            );
    }

    /////////////////////////////////////////////////////
    ////////////// EDIT/UPDATE ATIUM PLANS //////////////
    /////////////////////////////////////////////////////

    function editSavingsPlanGoal(uint256 _id, uint256 _goal) public inSavings(_id) {

        SavingsList memory s = SavingsList ({
            id: _id,
            user: msg.sender,
            amount: savingsById[_id].amount,
            goal: _goal,
            time: 0
        });

        savingsById[_id] = s;

        emit Savings(
            _id, 
            msg.sender, 
            savingsById[_id].amount,
            _goal, 
            0
            );
    }

    function editSavingsPlanTime(uint256 _id, uint256 _time) public inSavings(_id) {

        _time += block.timestamp;

        SavingsList memory s = SavingsList ({
            id: _id,
            user: msg.sender,
            amount: savingsById[_id].amount,
            goal: 0,
            time: _time
        });

        savingsById[_id] = s;

        emit Savings(
            _id, 
            msg.sender, 
            savingsById[_id].amount,
            0, 
            _time
            );
    }

    function editAllowancePlan(
        uint256 _id, 
        address _receiver, 
        uint256 _startDate, 
        uint256 _amount, 
        uint256 _interval
        ) external inAllowance(_id) {

        _startDate += block.timestamp;

        AllowanceList memory al = AllowanceList ({
            id: _id,
            sender: msg.sender,
            receiver: _receiver,
            deposit: allowanceById[_id].deposit,
            startDate: _startDate += block.timestamp,
            withdrawalAmount: _amount,
            withdrawalInterval: _interval
        });

        allowanceById[_id] = al;
        allowanceDate[_id] = _startDate;

        emit Allowance(
        _id, 
        msg.sender,
        _receiver, 
        allowanceById[_id].deposit,
        _startDate,
        _amount,
        _interval
        );
    }

    function editTrustfundPlan(
        uint256 _id, 
        address _receiver, 
        uint256 _startDate, 
        uint256 _amount, 
        uint256 _interval
        ) external inTrustfund(_id) {

        _startDate += block.timestamp;

        TrustFundList memory t = TrustFundList ({
            id: _id,
            sender: msg.sender,
            receiver: _receiver,
            amount: trustfundById[_id].amount,
            startDate: _startDate,
            withdrawalAmount: _amount,
            withdrawalInterval: _interval
        });

        trustfundById[_id] = t;
        trustfundDate[_id] = _startDate;

        emit Trustfund(
        _id, 
        msg.sender,
        _receiver, 
        trustfundById[_id].amount,
        _startDate,
        _amount,
        _interval
        );
    }

    function editGiftPlan(uint256 _id, address _receiver, uint256 _date) external inGift(_id) {

        _date += block.timestamp;

        GiftList memory g = GiftList ({
            id: _id,
            sender: msg.sender,
            receiver: _receiver,
            amount: giftById[_id].amount,
            date: _date
        });

        giftById[_id] = g;

        emit Gift(
            _id, 
            msg.sender, 
            _receiver, 
            giftById[_id].amount,
            _date
            );
    }

    /////////////////////////////////////////////////////
    ///////////////  GETTER FUNCTIONS ///////////////////
    /////////////////////////////////////////////////////

    function getAtium(uint256 _id) public view returns (AtiumList memory) {
        return atiumById[_id];
    }

    function getSavings(uint256 _id) public view returns (SavingsList memory) {
        return savingsById[_id];
    }

    function getAllowance(uint256 _id) public view returns (AllowanceList memory) {
        return allowanceById[_id];
    }

    function getTrustfund(uint256 _id) public view returns (TrustFundList memory) {
        return trustfundById[_id];
    }

    function getGift(uint256 _id) public view returns (GiftList memory) {
        return giftById[_id];
    }

    ////////////////////////////////////////////////////
    ///////////////////  MODIFIERS  ////////////////////
    ////////////////////////////////////////////////////

    modifier inSavings(uint256 _id) {
        if (savingsById[_id].user != msg.sender) {
            revert Atium_NotOwnerId();
        }
        _;
    }

    modifier inAllowance(uint256 _id) {
        if (allowanceById[_id].sender != msg.sender) {
            revert Atium_NotOwnerId();
        }
        _;
    }

    modifier inTrustfund(uint256 _id) {
        if (trustfundById[_id].sender != msg.sender) {
            revert Atium_NotOwnerId();
        }
        _;
    }

    modifier inGift(uint256 _id) {
        if (giftById[_id].sender != msg.sender) {
            revert Atium_NotOwnerId();
        }
        _;
    }
}
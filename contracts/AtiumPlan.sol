//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

error Atium_NotOwnerId();
error Atium_OnlyFutureDate();
error Atium_ZeroInput();

contract AtiumPlan {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

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

    mapping(address => uint256[]) internal userS_Ids;
    mapping(address => uint256[]) internal userA_Ids;
    mapping(address => uint256[]) internal userT_Ids;
    mapping(address => uint256[]) internal userG_Ids;

    mapping(address => EnumerableSet.UintSet) internal addrToActiveSavings;
    mapping(address => EnumerableSet.UintSet) internal addrToActiveAllowance;
    mapping(address => EnumerableSet.UintSet) internal addrToActiveTrustfund;
    mapping(address => EnumerableSet.UintSet) internal addrToActiveGift;

    mapping(address => uint256[]) internal receiverA_Ids;
    mapping(address => uint256[]) internal receiverT_Ids;
    mapping(address => uint256[]) internal receiverG_Ids;


    mapping(uint256 => uint256) internal allowanceDate;
    mapping(uint256 => uint256) internal trustfundDate;

    enum Select {SAVINGS, ALLOWANCE, TRUSTFUND, GIFT}
    //SAVINGS = 0, ALLOWANCE = 1, TRUSTFUND = 2. GIFT = 3

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
        userS_Ids[msg.sender].push(_savingsId.current());

        addrToActiveSavings[msg.sender].add(s.id);
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
        userS_Ids[msg.sender].push(_savingsId.current());

        addrToActiveSavings[msg.sender].add(s.id);
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
        userA_Ids[msg.sender].push(_allowanceId.current());
        receiverA_Ids[_receiver].push(_allowanceId.current());

        addrToActiveAllowance[msg.sender].add(al.id);
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
        userT_Ids[msg.sender].push(_trustfundId.current());
        receiverT_Ids[_receiver].push(_trustfundId.current());

        addrToActiveTrustfund[msg.sender].add(t.id);
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
        userG_Ids[msg.sender].push(_giftId.current());
        receiverG_Ids[_receiver].push(_giftId.current());

        addrToActiveGift[msg.sender].add(g.id);
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

        addrToActiveSavings[msg.sender].remove(_id);    
        addrToActiveSavings[msg.sender].add(_id); 
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

        addrToActiveSavings[msg.sender].remove(_id);    
        addrToActiveSavings[msg.sender].add(_id);
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

        addrToActiveAllowance[msg.sender].remove(_id);    
        addrToActiveAllowance[msg.sender].add(_id); 
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

        addrToActiveTrustfund[msg.sender].remove(_id);    
        addrToActiveTrustfund[msg.sender].add(_id); 
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

        addrToActiveGift[msg.sender].remove(_id);    
        addrToActiveGift[msg.sender].add(_id); 
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

    ///@notice - Get all active user savings
    function getAllActiveSavings() external view returns (SavingsList[] memory) {
        uint256[] memory allActiveSavings = userS_Ids[msg.sender];
        uint256 length = allActiveSavings.length;
        SavingsList[] memory allSavings = new SavingsList[](length);

        for (uint i = 0; i < length; ) {
            allSavings[i] = savingsById[allActiveSavings[i]];
            unchecked {
                ++i;
            }
        }

        return allSavings;
    }

    function getAllActiveAllowance() external view returns (AllowanceList[] memory) {
        uint256[] memory allActiveAllowance = userA_Ids[msg.sender];
        uint256 length = allActiveAllowance.length;
        AllowanceList[] memory allAllowance = new AllowanceList[](length);

        for (uint i = 0; i < length; ) {
            allAllowance[i] = allowanceById[allActiveAllowance[i]];
            unchecked {
                ++i;
            }
        }

        return allAllowance;
    }

    function getAllActiveTrustfund() external view returns (TrustFundList[] memory) {
        uint256[] memory allActiveTrustfund = userT_Ids[msg.sender];
        uint256 length = allActiveTrustfund.length;
        TrustFundList[] memory allTrustfund = new TrustFundList[](length);

        for (uint i = 0; i < length; ) {
            allTrustfund[i] = trustfundById[allActiveTrustfund[i]];
            unchecked {
                ++i;
            }
        }

        return allTrustfund;
    }

    function getAllActiveGift() external view returns (GiftList[] memory) {
        uint256[] memory allActiveGift = userG_Ids[msg.sender];
        uint256 length = allActiveGift.length;
        GiftList[] memory allGift = new GiftList[](length);

        for (uint i = 0; i < length; ) {
            allGift[i] = giftById[allActiveGift[i]];
            unchecked {
                ++i;
            }
        }

        return allGift;
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
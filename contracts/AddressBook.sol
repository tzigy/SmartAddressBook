pragma solidity ^0.4.18;

contract AddressBook {
    
    address public owner;
    uint constant private price = 2000000000000000000;
    bytes32[] public entries;
    mapping(bytes32 => bool) public availableEntries;
    
    
    modifier isOwner(){
        require(owner == msg.sender);
        _;
    }
    
    modifier costs() {
        require(msg.value >= price);
        _;
    }
    
    modifier isValidIndex(uint _index) {
        require(_index < entries.length);
        _;
    }
    
    function AddressBook() public{
        owner = msg.sender;
    }
    
    function addEntry(bytes32 _entry) public costs() payable returns(bool){
        if(availableEntries[_entry] == true) {
            return false;
        }
        availableEntries[_entry] = true;
        entries.push(_entry);
        
        return true;
    }
    
    function getEntryByIndex(uint _index) view public isValidIndex(_index) returns(bytes32){
        return entries[_index];
    }
    
    function getEntries() view public returns(bytes32[]){
        //return entries[_index];
        return entries;
    }
    
    function getBalance() view public isOwner() returns(uint){
        return this.balance;
    }
}
import React from 'react';
import SuggestionInputSearch from './index';

// Enzyme for testing components
import { shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TAB_KEY_CODE } from './keyboard.constants';

configure({ adapter: new Adapter() });

const DOWN_ARROW_KEY_CODE = 40;
const UP_ARROW_KEY_CODE = 38;
const ENTER_KEY_CODE = 13;
const ESCAPE_KEY_CODE = 27;

// Global mocking localStorage;
const localStorageMock = {
    setItem: jest.fn(),
    getItem: jest.fn()
};

const consoleMock = {
    error: jest.fn()
};

global.localStorage = localStorageMock;
global.console = consoleMock;

test('Should return empty array of suggestions when recentSearches is empty', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);

    const expectedSuggestions = [];
    expect(suggestionInputSearch.instance().getSuggestionsFor("star wars")).toEqual(expectedSuggestions);
});

test('Should return empty array of suggestions when entered term length is shorter than minLength', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch minLength={1} />);

    const expectedSuggestions = [];
    expect(suggestionInputSearch.instance().getSuggestionsFor("")).toEqual(expectedSuggestions);
});

test('Should return an array of suggestions when term entered match any term in recentSearches', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch recentSearches={['star wars']}/>);

    const expectedSuggestions = ['star wars'];
    expect(suggestionInputSearch.instance().getSuggestionsFor("star")).toEqual(expectedSuggestions);
});

test('Should return an array of suggestions when passed term entered match any term (caseinsensitive) in recentSearches', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch recentSearches={['star wars']}/>);

    const expectedSuggestions = ['star wars'];
    expect(suggestionInputSearch.instance().getSuggestionsFor("StAr")).toEqual(expectedSuggestions);
});

test('Should return 4th element in list of 5 elements when down arrow key pressed', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const suggestionsItemsLength = 5;
    const shiftingType = DOWN_ARROW_KEY_CODE;

    // Previous selected item index
    suggestionInputSearch.setState({selectedItemIndex: 3});

    expect(suggestionInputSearch.instance().selectItem(suggestionsItemsLength, shiftingType)).toEqual(4);
});

test('Should return 3rd element in list of 5 elements when up arrow key pressed', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const suggestionsItemsLength = 5;
    const shiftingType = UP_ARROW_KEY_CODE;

    // Previous selected item index
    suggestionInputSearch.setState({selectedItemIndex: 3});

    expect(suggestionInputSearch.instance().selectItem(suggestionsItemsLength, shiftingType)).toEqual(2);
});

test('Should return 1st element in list of 5 elements when down arrow key pressed and reached the end of the list', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const suggestionsItemsLength = 5;
    const shiftingType = DOWN_ARROW_KEY_CODE;

    // Previous selected item index
    suggestionInputSearch.setState({selectedItemIndex: 4});

    expect(suggestionInputSearch.instance().selectItem(suggestionsItemsLength, shiftingType)).toEqual(0);
});

test('Should return 1st element in list of 5 elements when up arrow key pressed and reached head of the list', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const suggestionsItemsLength = 5;
    const shiftingType = UP_ARROW_KEY_CODE; 

    // Previous selected item index
    suggestionInputSearch.setState({selectedItemIndex: 0});

    expect(suggestionInputSearch.instance().selectItem(suggestionsItemsLength, shiftingType)).toEqual(4);
});

test('should call selectItem fn when down_arrow key is pressed', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const selectedItemIndex = 3;
    const spySelectItem = jest.spyOn(suggestionInputSearch.instance(), 'selectItem').mockReturnValue(selectedItemIndex);
    const spySubmitSearch = jest.spyOn(suggestionInputSearch.instance(), 'submitSearch').mockReturnValue(selectedItemIndex);
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    const documentSpy = jest.spyOn(document, 'querySelector').mockReturnValue({ scrollTop: 0});
    const event = {
        keyCode: DOWN_ARROW_KEY_CODE, 
        target: { value: ""},
        preventDefault: () => {}
    };

    suggestionInputSearch.instance().handleOnKeyPress(event);

    expect(spySelectItem).toHaveBeenCalledTimes(1);
    expect(spySelectItem).toHaveBeenCalledWith(0, DOWN_ARROW_KEY_CODE);
    expect(spySubmitSearch).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(documentSpy).toHaveBeenCalledTimes(1);
});

test('should call selectItem fn when up_arrow key is pressed', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const selectedItemIndex = 3;
    const selectItemSpy = jest.spyOn(suggestionInputSearch.instance(), 'selectItem').mockReturnValue(selectedItemIndex);
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    const event = {
        keyCode: UP_ARROW_KEY_CODE, 
        target: { value: ""},
        preventDefault: () => {}
    };

    suggestionInputSearch.instance().handleOnKeyPress(event);

    expect(selectItemSpy).toHaveBeenCalledTimes(1);
    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should call submitSearch fn when enter_key is pressed and term is not empty', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const spy = jest.spyOn(suggestionInputSearch.instance(), 'submitSearch').mockReturnValue({});
    const event = { keyCode: ENTER_KEY_CODE };
    const initialState = { selectedItemIndex: 0 , suggestions: ['star wars'] };
    suggestionInputSearch.setState(initialState);

    suggestionInputSearch.instance().handleOnKeyPress(event);

    expect(spy).toHaveBeenCalledWith('star wars');
});

test('should call setState fn and hide suggestionList when escape_key is pressed', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const event = { keyCode: ESCAPE_KEY_CODE };
    const showSuggestions = true;
    const recentSearches = ['star wars'];
    const suggestions = ['star wars'];
    const term = 'star';
    const selectedItemIndex = 0;

    suggestionInputSearch.setState({
        showSuggestions,
        recentSearches,
        suggestions,
        term,
        selectedItemIndex
    });

    const spy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});

    suggestionInputSearch.instance().handleOnKeyPress(event);

    expect(spy).toHaveBeenCalledTimes(1);
});

test('should call submitSearch fn when clicking item from suggestion list', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const term = 'star wars';
    const spy = jest.spyOn(suggestionInputSearch.instance(), 'submitSearch').mockReturnValue({});
    const event = { target: { innerText: term } };

    suggestionInputSearch.instance().handleOnClickOnItem(event);

    expect(spy).toHaveBeenCalledWith(term);
    expect(spy).toHaveBeenCalledTimes(1);
});

test('should call setState when getting at least one suggestion when searching', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const term = 'star wars';
    const getSuggestionsSpy = jest.spyOn(suggestionInputSearch.instance(), 'getSuggestionsFor').mockReturnValue([term]);
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    const event = { target: { value: term } };

    suggestionInputSearch.instance().handleOnSearch(event);

    expect(getSuggestionsSpy).toHaveBeenCalledWith(term);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should call setState when getting any suggestion when searching', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const term = 'star wars';
    const getSuggestionsSpy = jest.spyOn(suggestionInputSearch.instance(), 'getSuggestionsFor').mockReturnValue([]);
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    const event = { target: { value: term } };

    suggestionInputSearch.instance().handleOnSearch(event);

    expect(getSuggestionsSpy).toHaveBeenCalledWith(term);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should call setState when selecting item index', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const selectedItemIndex = 1;
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});

    suggestionInputSearch.instance().handleOnSelectedItemIndex(selectedItemIndex);

    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should call setState when clicking outside the component', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const event = { target: {} };
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});

    suggestionInputSearch.instance().inputRef = { contains: () => false };
    suggestionInputSearch.instance().floatingLabelRef = { classList: { remove: () => {} } };
    suggestionInputSearch.instance().handleClickOutside(event);

    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should not call setState when clicking inside the component', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const event = { target: {} };
    const showSuggestions = true;
    const selectedItemIndex = 2;

    suggestionInputSearch.setState({ showSuggestions, selectedItemIndex });
    suggestionInputSearch.instance().inputRef = { contains: () => true };
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});

    suggestionInputSearch.instance().handleClickOutside(event);

    expect(setStateSpy).toHaveBeenCalledTimes(0);
});

test('should call setState when submiting the component and term passed not found', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch onSubmitFunction={() => {}}/>);
    const term = 'star wars';
    const recentSearches = ['star'];

    suggestionInputSearch.setState({ recentSearches });

    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    suggestionInputSearch.instance().submitSearch(term);

    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should call setState when submiting the component and term passed found', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch onSubmitFunction={() => {}}/>);
    const term = 'star wars';
    const recentSearches = [term];

    suggestionInputSearch.setState({ recentSearches });

    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    suggestionInputSearch.instance().submitSearch(term);

    expect(setStateSpy).toHaveBeenCalledTimes(1);
});

test('should fire console error when no submit function is provided', () => {
    
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const term = 'star wars';
    const recentSearches = [term];

    suggestionInputSearch.setState({ recentSearches });

    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    suggestionInputSearch.instance().submitSearch(term);

    expect(consoleMock.error.mock.calls.length).toBe(1);

    consoleMock.error.mockReset();
});

test('should remove handelClickOutside event listener when unmount component', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch onSubmitFunction={() => {}}/>);
    const removeEventListenerMock = jest.fn();
    document.removeEventListener = removeEventListenerMock;

    suggestionInputSearch.unmount();

    expect(removeEventListenerMock.mock.calls.length).toEqual(1);
});

test('Should call saveSearches when component is persistent and current recentSearches are different than previous ones', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);

    suggestionInputSearch.setProps({
        persistent: true
    });
    suggestionInputSearch.setState({
        recentSearches: ['star wars']
    });

    suggestionInputSearch.update();
    expect(localStorageMock.setItem.mock.calls.length).toBe(1);

    localStorageMock.setItem.mockReset();
});

test('should call submitSearch fn when tab_key is pressed and there is only one suggested term', () => {
    // GIVEN
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const spy = jest.spyOn(suggestionInputSearch.instance(), 'submitSearch').mockReturnValue({});

    // AND
    const event = { 
        keyCode: TAB_KEY_CODE, 
        preventDefault: () => {} 
    };
    const initialState = { selectedItemIndex: 0 , suggestions: ['star wars'], term: 'star' };
    suggestionInputSearch.setState(initialState);

    // WHEN
    suggestionInputSearch.instance().handleOnKeyPress(event);

    // THEN
    expect(spy).toHaveBeenCalledWith('star wars');
});

test('should call setState when clicking inputContainer', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);
    const setStateSpy = jest.spyOn(suggestionInputSearch.instance(), 'setState').mockReturnValue({});
    
    suggestionInputSearch.find('.search-input-container__inner').simulate('click');

    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(setStateSpy).toHaveBeenCalledWith({ inputClicked: true });
});

test('should call submitSearch when autocomplete on match is true and introduced term is equals to the one reamining in suggestions', () => {
    const suggestionInputSearch = shallow(<SuggestionInputSearch autocompleteOnMatch={true} />);
    const term = 'star wars';
    const getSuggestionsSpy = jest.spyOn(suggestionInputSearch.instance(), 'getSuggestionsFor').mockReturnValue([term]);
    const submitSearchSpy = jest.spyOn(suggestionInputSearch.instance(), 'submitSearch').mockReturnValue({});
    const event = { target: { value: term } };

    suggestionInputSearch.instance().handleOnSearch(event);

    expect(getSuggestionsSpy).toHaveBeenCalledWith(term);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(submitSearchSpy).toHaveBeenCalledTimes(1);
    expect(submitSearchSpy).toHaveBeenCalledWith(term);
});

test('Should match default props', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch />);

    const defaultProps = {
        inputClass: 'suggestion-input',
        inputPosition: 'start',
        suggestionListClass: 'suggestions-container',
        placeholder: 'Search...',
        recentSearches: [],
        minLength: 1,
        persistent: false,
        floatingLabel: false,
        autocompleteOnMatch: false,
        maxSuggestions: 5
    };

    expect(suggestionInputSearch.instance().props).toEqual(defaultProps);
});

test('Should return an array of suggestions matching the term and limited by maxSuggestionsProp (two in this case)', () =>{
    const suggestionInputSearch = shallow(<SuggestionInputSearch 
        recentSearches={['star wars', 'star wars 2', 'star wars 3']} />);

    const expectedSuggestions = ['star wars', 'star wars 2', 'star wars 3'];
    expect(suggestionInputSearch.instance().getSuggestionsFor("star")).toEqual(expectedSuggestions);
});
function id(x) { return x[0]; }


import lexer from './lexer'
import {
  createNumber,
  createString,
  createRegExp,
  createLiteral,
  createIdentifier,
  createCommaExpression,
  createMemberExpression,
  createCallExpression,
  createUnaryExpression,
  createConditionalExpression,
  createLogicalExpression,
  createBinaryExpression,
  createDeclaration,
  createArrowFunction,
  createRangeExpression,
  createArrayExpression,
  createObjectExpression,
  createSelectExpression,
  createCases,
  createCase,
  createMain
} from './postprocessor'

export default {
    Lexer: lexer,
    ParserRules: [
    {"name": "Main$ebnf$1", "symbols": ["Expression"], "postprocess": id},
    {"name": "Main$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Main", "symbols": ["_", "Declarations", "Main$ebnf$1", "_"], "postprocess": d => createMain(d[1], d[2])},
    {"name": "Declarations", "symbols": ["Declarations", "Declaration"], "postprocess": d => d[0].concat([d[1]])},
    {"name": "Declarations", "symbols": [], "postprocess": d => []},
    {"name": "Declaration", "symbols": ["IDENTIFIER", "_", "ArrowFunction", "_", {"literal":";"}, "_"], "postprocess": d => createDeclaration(d[0], d[2])},
    {"name": "ArrowFunction", "symbols": [{"literal":"("}, "_", "FunctionArgs", "_", {"literal":")"}, "_", {"literal":"=>"}, "_", "Expression", "_"], "postprocess": d => createArrowFunction(d[2].expressions, d[8])},
    {"name": "FunctionArgs$ebnf$1", "symbols": []},
    {"name": "FunctionArgs$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "IDENTIFIER"]},
    {"name": "FunctionArgs$ebnf$1", "symbols": ["FunctionArgs$ebnf$1", "FunctionArgs$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FunctionArgs", "symbols": ["IDENTIFIER", "FunctionArgs$ebnf$1"], "postprocess": d => createCommaExpression(d)},
    {"name": "FunctionArgs", "symbols": [], "postprocess": d => createCommaExpression()},
    {"name": "CommaExpression$ebnf$1", "symbols": []},
    {"name": "CommaExpression$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "CommaExpressionItem"]},
    {"name": "CommaExpression$ebnf$1", "symbols": ["CommaExpression$ebnf$1", "CommaExpression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "CommaExpression", "symbols": ["CommaExpressionItem", "CommaExpression$ebnf$1"], "postprocess": d => createCommaExpression(d)},
    {"name": "CommaExpression", "symbols": [], "postprocess": d => createCommaExpression()},
    {"name": "CommaExpressionItem", "symbols": ["Expression"], "postprocess": id},
    {"name": "CommaExpressionItem", "symbols": ["ArrowFunction"], "postprocess": id},
    {"name": "Expression", "symbols": ["ConditionalExpression"], "postprocess": id},
    {"name": "ConditionalExpression", "symbols": ["LogicalOr", "_", {"literal":"?"}, "_", "Expression", "_", {"literal":":"}, "_", "Expression"], "postprocess": d => createConditionalExpression(d[0], d[4], d[8])},
    {"name": "ConditionalExpression", "symbols": ["LogicalOr"], "postprocess": id},
    {"name": "LogicalOr", "symbols": ["LogicalOr", "_", "LOGICAL_OR", "_", "LogicalAnd"], "postprocess": d => createLogicalExpression(d[0], d[2], d[4])},
    {"name": "LogicalOr", "symbols": ["LogicalAnd"], "postprocess": id},
    {"name": "LogicalAnd", "symbols": ["LogicalAnd", "_", "LOGICAL_AND", "_", "BitwiseOrAndXor"], "postprocess": d => createLogicalExpression(d[0], d[2], d[4])},
    {"name": "LogicalAnd", "symbols": ["BitwiseOrAndXor"], "postprocess": id},
    {"name": "BitwiseOrAndXor", "symbols": ["BitwiseOrAndXor", "_", "BITWISE_OR_AND_XOR", "_", "Equal"], "postprocess": d => createLogicalExpression(d[0], d[2], d[4])},
    {"name": "BitwiseOrAndXor", "symbols": ["Equal"], "postprocess": id},
    {"name": "Equal", "symbols": ["Equal", "_", "EQUAL", "_", "LessThenGreaterThen"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "Equal", "symbols": ["LessThenGreaterThen"], "postprocess": id},
    {"name": "LessThenGreaterThen", "symbols": ["LessThenGreaterThen", "_", "LTGTE", "_", "Shift"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "LessThenGreaterThen", "symbols": ["Shift"], "postprocess": id},
    {"name": "Shift", "symbols": ["Shift", "_", "BITWISE_SHIFT", "_", "AddSubtract"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "Shift", "symbols": ["AddSubtract"], "postprocess": id},
    {"name": "AddSubtract", "symbols": ["AddSubtract", "_", "ADD_SUBTRACT", "_", "MultiplyDivideModulo"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "AddSubtract", "symbols": ["MultiplyDivideModulo"], "postprocess": id},
    {"name": "MultiplyDivideModulo", "symbols": ["MultiplyDivideModulo", "_", "MULTIPLY_DIVIDE_MODULO", "_", "Exponentiation"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "MultiplyDivideModulo", "symbols": ["Exponentiation"], "postprocess": id},
    {"name": "Exponentiation", "symbols": ["Exponentiation", "_", "EXPONENTIATION", "_", "UnaryExpression"], "postprocess": d => createBinaryExpression(d[0], d[2], d[4])},
    {"name": "Exponentiation", "symbols": ["UnaryExpression"], "postprocess": id},
    {"name": "UnaryExpression", "symbols": ["NOT", "_", "MemberExpression"], "postprocess": d => createUnaryExpression(d[0], d[2])},
    {"name": "UnaryExpression", "symbols": [{"literal":"~"}, "_", "MemberExpression"], "postprocess": d => createUnaryExpression(d[0], d[2])},
    {"name": "UnaryExpression", "symbols": [{"literal":"+"}, "_", "MemberExpression"], "postprocess": d => createUnaryExpression(d[0], d[2])},
    {"name": "UnaryExpression", "symbols": [{"literal":"-"}, "_", "MemberExpression"], "postprocess": d => createUnaryExpression(d[0], d[2])},
    {"name": "UnaryExpression", "symbols": ["MemberExpression"], "postprocess": id},
    {"name": "MemberExpression", "symbols": ["MemberExpression", "_", {"literal":"."}, "_", "IDENTIFIER"], "postprocess": d => createMemberExpression(d[0], false, d[4])},
    {"name": "MemberExpression", "symbols": ["MemberExpression", "_", {"literal":"["}, "_", "Expression", "_", {"literal":"]"}], "postprocess": d => createMemberExpression(d[0], true, d[4])},
    {"name": "MemberExpression", "symbols": ["MemberExpression", "_", {"literal":"("}, "_", "CommaExpression", "_", {"literal":")"}], "postprocess": d => createCallExpression(d[0], d[4].expressions)},
    {"name": "MemberExpression", "symbols": ["Parenthesis"], "postprocess": id},
    {"name": "Parenthesis", "symbols": [{"literal":"("}, "_", "Expression", "_", {"literal":")"}], "postprocess": d => { d[2].parenthesis = d[2].type !== 'Identifier' && d[2].type !== 'Literal'; return d[2] }},
    {"name": "Parenthesis", "symbols": ["Value"], "postprocess": id},
    {"name": "Value", "symbols": ["TRUE"], "postprocess": id},
    {"name": "Value", "symbols": ["FALSE"], "postprocess": id},
    {"name": "Value", "symbols": ["NULL"], "postprocess": id},
    {"name": "Value", "symbols": ["THIS"], "postprocess": id},
    {"name": "Value", "symbols": ["NUMBER"], "postprocess": id},
    {"name": "Value", "symbols": ["STRING"], "postprocess": id},
    {"name": "Value", "symbols": ["REGEXP"], "postprocess": id},
    {"name": "Value", "symbols": ["Range"], "postprocess": id},
    {"name": "Value", "symbols": ["Array"], "postprocess": id},
    {"name": "Value", "symbols": ["Object"], "postprocess": id},
    {"name": "Value", "symbols": ["Select"], "postprocess": id},
    {"name": "Value", "symbols": ["IDENTIFIER"], "postprocess": id},
    {"name": "Select", "symbols": ["SELECT", "_", {"literal":"("}, "_", "Expression", "_", {"literal":")"}, "_", "Cases"], "postprocess": d => createSelectExpression(d[4], d[8])},
    {"name": "Cases$ebnf$1", "symbols": []},
    {"name": "Cases$ebnf$1$subexpression$1", "symbols": ["_", "Case"]},
    {"name": "Cases$ebnf$1", "symbols": ["Cases$ebnf$1", "Cases$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Cases", "symbols": [{"literal":"{"}, "Cases$ebnf$1", "_", {"literal":"}"}], "postprocess": d => createCases(d)},
    {"name": "Case", "symbols": ["WHEN", "_", "Expression", "_", "THEN", "_", "Expression"], "postprocess": d => createCase(d[2], d[6])},
    {"name": "Case", "symbols": ["DEFAULT", "_", "Expression"], "postprocess": d => createCase(null, d[2])},
    {"name": "Range", "symbols": [{"literal":"["}, "_", "Expression", "TO", "Expression", "_", {"literal":"]"}], "postprocess": d => createRangeExpression(d[2], d[4])},
    {"name": "Array", "symbols": [{"literal":"["}, "_", "CommaExpression", "_", {"literal":"]"}], "postprocess": d => createArrayExpression(d[2].expressions)},
    {"name": "Object$ebnf$1", "symbols": []},
    {"name": "Object$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "Pair"]},
    {"name": "Object$ebnf$1", "symbols": ["Object$ebnf$1", "Object$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Object", "symbols": [{"literal":"{"}, "_", "Pair", "Object$ebnf$1", "_", {"literal":"}"}], "postprocess": d => createObjectExpression(d)},
    {"name": "Object", "symbols": [{"literal":"{"}, "_", {"literal":"}"}], "postprocess": d => createObjectExpression()},
    {"name": "Pair", "symbols": [{"literal":"["}, "_", "Expression", "_", {"literal":"]"}, "_", {"literal":":"}, "_", "Expression"], "postprocess": d => [d[2], d[8], true]},
    {"name": "Pair", "symbols": [{"literal":"["}, "_", "Expression", "_", {"literal":"]"}], "postprocess": d => [d[2], d[2], true]},
    {"name": "Pair", "symbols": ["Objectkey", "_", {"literal":":"}, "_", "Expression"], "postprocess": d => [d[0][0], d[4], false]},
    {"name": "Pair", "symbols": ["Objectkey"], "postprocess": d => [d[0][0], d[0][1], false]},
    {"name": "Objectkey", "symbols": ["IDENTIFIER"], "postprocess": d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]]},
    {"name": "Objectkey", "symbols": ["FALSE"], "postprocess": d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]]},
    {"name": "Objectkey", "symbols": ["TRUE"], "postprocess": d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]]},
    {"name": "Objectkey", "symbols": ["NULL"], "postprocess": d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]]},
    {"name": "Objectkey", "symbols": ["NUMBER"], "postprocess": d => [Object.assign({}, d[0], {type: 'String', value: d[0].text, text: `'${d[0].text}'`}), d[0]]},
    {"name": "Objectkey", "symbols": ["QUOTED_STRING"], "postprocess": d => [d[0], d[0]]},
    {"name": "BETWEEN", "symbols": [(lexer.has("BETWEEN") ? {type: "BETWEEN"} : BETWEEN)], "postprocess": d => 'BETWEEN'},
    {"name": "FROM", "symbols": [(lexer.has("FROM") ? {type: "FROM"} : FROM)], "postprocess": d => 'FROM'},
    {"name": "TO", "symbols": [(lexer.has("TO") ? {type: "TO"} : TO)], "postprocess": d => 'TO'},
    {"name": "TRUE", "symbols": [(lexer.has("TRUE") ? {type: "TRUE"} : TRUE)], "postprocess": d => createLiteral(d[0], true)},
    {"name": "FALSE", "symbols": [(lexer.has("FALSE") ? {type: "FALSE"} : FALSE)], "postprocess": d => createLiteral(d[0], false)},
    {"name": "NULL", "symbols": [(lexer.has("NULL") ? {type: "NULL"} : NULL)], "postprocess": d => createLiteral(d[0], null)},
    {"name": "LOGICAL_OR", "symbols": [(lexer.has("LOGICAL_OR") ? {type: "LOGICAL_OR"} : LOGICAL_OR)], "postprocess": d => '||'},
    {"name": "LOGICAL_AND", "symbols": [(lexer.has("LOGICAL_AND") ? {type: "LOGICAL_AND"} : LOGICAL_AND)], "postprocess": d => '&&'},
    {"name": "BITWISE_OR_AND_XOR", "symbols": [(lexer.has("BITWISE_OR") ? {type: "BITWISE_OR"} : BITWISE_OR)], "postprocess": id},
    {"name": "BITWISE_OR_AND_XOR", "symbols": [(lexer.has("BITWISE_AND") ? {type: "BITWISE_AND"} : BITWISE_AND)], "postprocess": id},
    {"name": "BITWISE_OR_AND_XOR", "symbols": [(lexer.has("BITWISE_XOR") ? {type: "BITWISE_XOR"} : BITWISE_XOR)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("EQ3") ? {type: "EQ3"} : EQ3)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("NEQ3") ? {type: "NEQ3"} : NEQ3)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("EQ2") ? {type: "EQ2"} : EQ2)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("NEQ2") ? {type: "NEQ2"} : NEQ2)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("EQ1") ? {type: "EQ1"} : EQ1)], "postprocess": id},
    {"name": "EQUAL", "symbols": [(lexer.has("NEQ1") ? {type: "NEQ1"} : NEQ1)], "postprocess": id},
    {"name": "LTGTE", "symbols": [(lexer.has("LT") ? {type: "LT"} : LT)], "postprocess": id},
    {"name": "LTGTE", "symbols": [(lexer.has("LTE") ? {type: "LTE"} : LTE)], "postprocess": id},
    {"name": "LTGTE", "symbols": [(lexer.has("GT") ? {type: "GT"} : GT)], "postprocess": id},
    {"name": "LTGTE", "symbols": [(lexer.has("GTE") ? {type: "GTE"} : GTE)], "postprocess": id},
    {"name": "LTGTE", "symbols": [(lexer.has("IN") ? {type: "IN"} : IN)], "postprocess": d => 'IN'},
    {"name": "LTGTE", "symbols": [(lexer.has("BETWEEN") ? {type: "BETWEEN"} : BETWEEN)], "postprocess": d => 'BETWEEN'},
    {"name": "LTGTE", "symbols": [(lexer.has("INSTANCE_OF") ? {type: "INSTANCE_OF"} : INSTANCE_OF)], "postprocess": d => 'INSTANCE_OF'},
    {"name": "BITWISE_SHIFT", "symbols": [(lexer.has("BITWISE_SHIFT_LEFT") ? {type: "BITWISE_SHIFT_LEFT"} : BITWISE_SHIFT_LEFT)], "postprocess": id},
    {"name": "BITWISE_SHIFT", "symbols": [(lexer.has("BITWISE_SHIFT_RIGHT") ? {type: "BITWISE_SHIFT_RIGHT"} : BITWISE_SHIFT_RIGHT)], "postprocess": id},
    {"name": "BITWISE_SHIFT", "symbols": [(lexer.has("BITWISE_UNSIGNED_SHIFT_RIGHT") ? {type: "BITWISE_UNSIGNED_SHIFT_RIGHT"} : BITWISE_UNSIGNED_SHIFT_RIGHT)], "postprocess": id},
    {"name": "ADD_SUBTRACT", "symbols": [(lexer.has("ADD") ? {type: "ADD"} : ADD)], "postprocess": id},
    {"name": "ADD_SUBTRACT", "symbols": [(lexer.has("SUBTRACT") ? {type: "SUBTRACT"} : SUBTRACT)], "postprocess": id},
    {"name": "MULTIPLY_DIVIDE_MODULO", "symbols": [(lexer.has("MULTIPLY") ? {type: "MULTIPLY"} : MULTIPLY)], "postprocess": id},
    {"name": "MULTIPLY_DIVIDE_MODULO", "symbols": [(lexer.has("DIVIDE") ? {type: "DIVIDE"} : DIVIDE)], "postprocess": id},
    {"name": "MULTIPLY_DIVIDE_MODULO", "symbols": [(lexer.has("MODULO") ? {type: "MODULO"} : MODULO)], "postprocess": id},
    {"name": "NOT", "symbols": [(lexer.has("NOT") ? {type: "NOT"} : NOT)], "postprocess": d => '!'},
    {"name": "EXPONENTIATION", "symbols": [(lexer.has("EXPONENTIATION") ? {type: "EXPONENTIATION"} : EXPONENTIATION)], "postprocess": id},
    {"name": "THIS", "symbols": [(lexer.has("THIS") ? {type: "THIS"} : THIS)], "postprocess": d => createLiteral(d[0], 'THIS')},
    {"name": "SELECT", "symbols": [(lexer.has("SELECT") ? {type: "SELECT"} : SELECT)], "postprocess": d => createLiteral(d[0], 'SELECT')},
    {"name": "WHEN", "symbols": [(lexer.has("WHEN") ? {type: "WHEN"} : WHEN)], "postprocess": d => createLiteral(d[0], 'WHEN')},
    {"name": "THEN", "symbols": [(lexer.has("THEN") ? {type: "THEN"} : THEN)], "postprocess": d => createLiteral(d[0], 'THEN')},
    {"name": "DEFAULT", "symbols": [(lexer.has("DEFAULT") ? {type: "DEFAULT"} : DEFAULT)], "postprocess": d => createLiteral(d[0], 'DEFAULT')},
    {"name": "NUMBER", "symbols": [(lexer.has("NUMBER") ? {type: "NUMBER"} : NUMBER)], "postprocess": d => createNumber(d[0])},
    {"name": "QUOTED_STRING", "symbols": [(lexer.has("DOUBLE_QUOTED_STRING") ? {type: "DOUBLE_QUOTED_STRING"} : DOUBLE_QUOTED_STRING)], "postprocess": d => createString(d[0], 'String')},
    {"name": "QUOTED_STRING", "symbols": [(lexer.has("SINGLE_QUOTED_STRING") ? {type: "SINGLE_QUOTED_STRING"} : SINGLE_QUOTED_STRING)], "postprocess": d => createString(d[0], 'String')},
    {"name": "STRING", "symbols": ["QUOTED_STRING"], "postprocess": id},
    {"name": "STRING", "symbols": [(lexer.has("TEMPLATE_STRING") ? {type: "TEMPLATE_STRING"} : TEMPLATE_STRING)], "postprocess": d => createString(d[0], 'TemplateString')},
    {"name": "STRING", "symbols": ["IDENTIFIER", "_", (lexer.has("TEMPLATE_STRING") ? {type: "TEMPLATE_STRING"} : TEMPLATE_STRING)], "postprocess": d => createString(d[2], 'TemplateString', d[0])},
    {"name": "REGEXP", "symbols": [(lexer.has("REGEXP") ? {type: "REGEXP"} : REGEXP)], "postprocess": d => createRegExp(d[0])},
    {"name": "IDENTIFIER", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": d => createIdentifier(d[0])},
    {"name": "ARROW", "symbols": [(lexer.has("ARROW") ? {type: "ARROW"} : ARROW)], "postprocess": id},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("SPACE") ? {type: "SPACE"} : SPACE)], "postprocess": d => null}
]
  , ParserStart: "Main"
}

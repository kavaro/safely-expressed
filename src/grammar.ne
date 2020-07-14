@{%

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

%}

@lexer lexer

Main -> _ Declarations Expression:? _ {% d => createMain(d[1], d[2]) %}

# sum(a, b) => a + b; max(a, b) => a >= b ? a : b; pi() => 3.14;
Declarations -> 
    Declarations Declaration {% d => d[0].concat([d[1]]) %}
  | null                     {% d => [] %}

Declaration ->
    IDENTIFIER _ ArrowFunction _ ";" _ {% d => createDeclaration(d[0], d[2]) %}

ArrowFunction ->
    "(" _ FunctionArgs _ ")" _ "=>" _ Expression _ {% d => createArrowFunction(d[2].expressions, d[8]) %}

FunctionArgs ->
    IDENTIFIER (_ "," _ IDENTIFIER):* {% d => createCommaExpression(d) %}
  | null                              {% d => createCommaExpression() %}

CommaExpression -> 
    CommaExpressionItem (_ "," _ CommaExpressionItem):* {% d => createCommaExpression(d) %}
  | null                                                {% d => createCommaExpression() %}

CommaExpressionItem ->
    Expression    {% id %}
  | ArrowFunction {% id %}

Expression ->
    ConditionalExpression {% id %}

# condition ? match : no_match
ConditionalExpression ->
    LogicalOr _ "?" _ Expression _ ":" _ Expression {% d => createConditionalExpression(d[0], d[4], d[8]) %}
  | LogicalOr {% id %}

# a || b
# a OR b
# a OF b
LogicalOr ->
    LogicalOr _ LOGICAL_OR _ LogicalAnd {% d => createLogicalExpression(d[0], d[2], d[4]) %}
  | LogicalAnd {% id %}

# a && b
# a AND b
# a EN b
LogicalAnd ->
    LogicalAnd _ LOGICAL_AND _ BitwiseOrAndXor {% d => createLogicalExpression(d[0], d[2], d[4]) %}
  | BitwiseOrAndXor {% id %}

# a & b
# a | b
# a ^ b
BitwiseOrAndXor ->
    BitwiseOrAndXor _ BITWISE_OR_AND_XOR _ Equal {% d => createLogicalExpression(d[0], d[2], d[4]) %}
  | Equal {% id %}

# a = b -> a === b
# a != b -> a !== b
Equal ->
    Equal _ EQUAL _ LessThenGreaterThen {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | LessThenGreaterThen {% id %}

# a < b
# a <= b
# a > b
# a >= b
# a IN b
LessThenGreaterThen ->
    LessThenGreaterThen _ LTGTE _ Shift {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | Shift {% id %}

# a << b
# a >> b
# a >>> b
Shift ->
    Shift _ BITWISE_SHIFT _ AddSubtract {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | AddSubtract {% id %}

# a - b
# a + b
AddSubtract ->
    AddSubtract _ ADD_SUBTRACT _ MultiplyDivideModulo {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | MultiplyDivideModulo {% id %}

# a * b
# a / b
# a % b
MultiplyDivideModulo ->
    MultiplyDivideModulo _ MULTIPLY_DIVIDE_MODULO _ Exponentiation {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | Exponentiation {% id %}

# a ^ b
# a ** b
# a EXP b
Exponentiation ->
    Exponentiation _ EXPONENTIATION _ UnaryExpression {% d => createBinaryExpression(d[0], d[2], d[4]) %}
  | UnaryExpression {% id %}

# !a (logical not)
# NOT a (logical not)
# NIET a (logical not)
# ~a (bitwise not)
# +a (positive)
# -a (negative)
UnaryExpression ->
    NOT _ MemberExpression {% d => createUnaryExpression(d[0], d[2]) %}
  | "~" _ MemberExpression {% d => createUnaryExpression(d[0], d[2]) %}
  | "+" _ MemberExpression {% d => createUnaryExpression(d[0], d[2]) %}
  | "-" _ MemberExpression {% d => createUnaryExpression(d[0], d[2]) %}
  | MemberExpression       {% id %}

# a.b
# a[b]
# a()
# a(b)
MemberExpression ->
    MemberExpression _ "." _ IDENTIFIER            {% d => createMemberExpression(d[0], false, d[4]) %}
  | MemberExpression _ "[" _ Expression _ "]"      {% d => createMemberExpression(d[0], true, d[4]) %}
  | MemberExpression _ "(" _ CommaExpression _ ")" {% d => createCallExpression(d[0], d[4].expressions) %}
  | Parenthesis                                    {% id %}

# (expression)
Parenthesis -> 
    "(" _ Expression _ ")" {% d => { d[2].parenthesis = d[2].type !== 'Identifier' && d[2].type !== 'Literal'; return d[2] } %}
  | Value                  {% id %}

Value -> 
    TRUE        {% id %} # TRUE
  | FALSE       {% id %} # FALSE
  | NULL        {% id %} # NULL or NUL
  | THIS        {% id %} # context
  | NUMBER      {% id %} # 123 or 1.23 or -123
  | STRING      {% id %} # "AB" or 'AB' or `before {name.first + `{nested}` after}`
  | REGEXP      {% id %} # /^AB$/
  | Range       {% id %} # (a TO b)
  | Array       {% id %} # [...]
  | Object      {% id %} # {...}
  | Select      {% id %} # SELECT(value) { 'increment': value++, 'decrement': value--}
  | IDENTIFIER  {% id %} # AB

Select ->
    SELECT _ "(" _ Expression _ ")" _ Cases {% d => createSelectExpression(d[4], d[8]) %}

Cases ->
    "{" (_ Case):* _ "}" {% d => createCases(d) %} # { expression: expression, ...} object

Case -> 
    WHEN _ Expression _ THEN _ Expression {% d => createCase(d[2], d[6]) %} 
  | DEFAULT _ Expression                  {% d => createCase(null, d[2]) %}

Range ->
    "[" _ Expression TO Expression _ "]" {% d => createRangeExpression(d[2], d[4]) %} #  [100...200] 

Array ->
    "[" _ CommaExpression _ "]"            {% d => createArrayExpression(d[2].expressions) %}       # [100, 200] array

Object ->
    "{" _ Pair (_ "," _ Pair):* _ "}"      {% d => createObjectExpression(d) %} # { expression: expression, ...} object
  | "{" _ "}"                              {% d => createObjectExpression() %}  # {} empty object

Pair -> 
    "[" _ Expression _ "]" _ ":" _ Expression {% d => [d[2], d[8], true] %} 
  | "[" _ Expression _ "]"                    {% d => [d[2], d[2], true] %}
  | Objectkey _ ":" _ Expression              {% d => [d[0][0], d[4], false] %}
  | Objectkey                                 {% d => [d[0][0], d[0][1], false] %}

Objectkey ->
    IDENTIFIER      {% d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]] %}
  | FALSE           {% d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]] %}
  | TRUE            {% d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]] %}
  | NULL            {% d => [Object.assign({}, d[0], {type: 'String', text: `'${d[0].text}'`}), d[0]] %}
  | NUMBER          {% d => [Object.assign({}, d[0], {type: 'String', value: d[0].text, text: `'${d[0].text}'`}), d[0]] %}
  | QUOTED_STRING   {% d => [d[0], d[0]] %}

BETWEEN        -> %BETWEEN {% d => 'BETWEEN' %} 
FROM           -> %FROM {% d => 'FROM' %} 
TO             -> %TO {% d => 'TO' %} 
TRUE           -> %TRUE {% d => createLiteral(d[0], true) %}
FALSE          -> %FALSE {% d => createLiteral(d[0], false) %}
NULL           -> %NULL {% d => createLiteral(d[0], null) %}

LOGICAL_OR     -> %LOGICAL_OR {% d => '||' %}
LOGICAL_AND    -> %LOGICAL_AND {% d => '&&' %}

BITWISE_OR_AND_XOR ->
    %BITWISE_OR  {% id %}
  | %BITWISE_AND {% id %}
  | %BITWISE_XOR {% id %}

EQUAL ->
    %EQ3  {% id %}
  | %NEQ3 {% id %}
  | %EQ2  {% id %}
  | %NEQ2 {% id %}
  | %EQ1  {% id %}
  | %NEQ1 {% id %}

LTGTE ->
    %LT  {% id %}
  | %LTE {% id %}
  | %GT  {% id %}
  | %GTE {% id %}
  | %IN  {% d => 'IN' %}
  | %BETWEEN  {% d => 'BETWEEN' %}
  | %INSTANCE_OF {% d => 'INSTANCE_OF' %}

BITWISE_SHIFT ->
    %BITWISE_SHIFT_LEFT  {% id %}
  | %BITWISE_SHIFT_RIGHT {% id %}
  | %BITWISE_UNSIGNED_SHIFT_RIGHT {% id %}

ADD_SUBTRACT ->
    %ADD      {% id %}
  | %SUBTRACT {% id %}

MULTIPLY_DIVIDE_MODULO ->
    %MULTIPLY {% id %}
  | %DIVIDE   {% id %}
  | %MODULO   {% id %}

NOT            -> %NOT            {% d => '!' %}
EXPONENTIATION -> %EXPONENTIATION {% id %}
THIS           -> %THIS           {% d => createLiteral(d[0], 'THIS') %}
SELECT         -> %SELECT         {% d => createLiteral(d[0], 'SELECT') %}
WHEN           -> %WHEN           {% d => createLiteral(d[0], 'WHEN') %}
THEN           -> %THEN           {% d => createLiteral(d[0], 'THEN') %}
DEFAULT        -> %DEFAULT        {% d => createLiteral(d[0], 'DEFAULT') %}

NUMBER -> %NUMBER {% d => createNumber(d[0]) %}

QUOTED_STRING ->
    %DOUBLE_QUOTED_STRING {% d => createString(d[0], 'String') %}
  | %SINGLE_QUOTED_STRING {% d => createString(d[0], 'String') %}

STRING -> 
    QUOTED_STRING         {% id %}
  | %TEMPLATE_STRING      {% d => createString(d[0], 'TemplateString') %}
  | IDENTIFIER _ %TEMPLATE_STRING {% d => createString(d[2], 'TemplateString', d[0]) %}
REGEXP -> %REGEXP         {% d => createRegExp(d[0]) %}
IDENTIFIER -> %IDENTIFIER {% d => createIdentifier(d[0]) %}
ARROW -> %ARROW           {% id %}
_ -> null | %SPACE {% d => null %}

